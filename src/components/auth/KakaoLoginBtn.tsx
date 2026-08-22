import { useRef, useState } from "react";
import kakaoIcon from "@/assets/kakaoIcon.svg";
import { analyticsTrack } from "@/analytics/analytics";
import * as Sentry from "@sentry/react";
import { supabase } from "../../../supabase/client";
import { buildTalkLaunchUrl, canLaunchKakaoTalk } from "@/lib/kakaoTalkLaunch";
import {
  claimSession,
  clearHandoffMarker,
  createHandoffPair,
  markHandoffStarted,
} from "@/lib/authHandoff";

interface KakaoLoginBtnProps {
  redirectUrl: string;
}

// 모바일이면 카카오톡 앱 원탭 발사 + 세션 핸드오프 릴레이로 이 탭에 로그인.
// 그 외/실패는 기존 웹 리다이렉트. 설계: docs/plans/kakao-login-handoff.md
const KakaoLoginBtn: React.FC<KakaoLoginBtnProps> = ({ redirectUrl }) => {
  const [isWaitingTalk, setIsWaitingTalk] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const webRedirectLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: redirectUrl },
    });
    if (error) {
      console.error("Kakao login error:", error.message);
      Sentry.captureException(error.message);
    }
  };

  const talkLaunchLogin = async () => {
    // ① secret(이 탭 메모리)·nonce(SHA-256 커밋) 생성 → redirectTo 에 nonce 탑재
    const { secret, nonce } = await createHandoffPair();
    const redirectTo = new URL(redirectUrl);
    redirectTo.searchParams.set("handoff", nonce);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: redirectTo.toString(),
        skipBrowserRedirect: true, // 리다이렉트 대신 URL 만 받아 카카오톡으로 발사
      },
    });
    if (error || !data?.url) {
      Sentry.captureException(
        error?.message ?? "kakao signInWithOAuth: no url",
      );
      return webRedirectLogin(); // 개시 실패 → 기존 웹 플로우
    }

    // ② 같은 탭 폴백(톡 미설치 → 웹 플로우 진행) 대비 개시 마커
    markHandoffStarted();
    setIsTimeout(false);
    setIsWaitingTalk(true);
    window.location.href = buildTalkLaunchUrl(data.url, data.url);

    // ③ 카카오톡에서 로그인이 완결되면 릴레이로 토큰 수령 → 이 탭에 세션 확립
    const abortController = new AbortController();
    abortRef.current = abortController;
    const tokens = await claimSession(secret, {
      signal: abortController.signal,
    });
    if (!tokens) {
      setIsWaitingTalk(false);
      if (!abortController.signal.aborted) setIsTimeout(true);
      return;
    }
    const { error: sessionError } = await supabase.auth.setSession(tokens);
    if (sessionError) {
      Sentry.captureException(sessionError.message);
      setIsWaitingTalk(false);
      setIsTimeout(true);
      return;
    }
    clearHandoffMarker();
    window.location.href = redirectUrl; // 세션 보유 상태로 원래 목적지 진입
  };

  const handleKakaoLoginBtnClick = async () => {
    if (isWaitingTalk) return;
    analyticsTrack("클릭_카카오_로그인", { where: "KakaoLoginBtn" });
    if (canLaunchKakaoTalk()) await talkLaunchLogin();
    else await webRedirectLogin();
  };

  const onClickCancelWaiting = () => {
    abortRef.current?.abort();
    clearHandoffMarker();
    setIsWaitingTalk(false);
  };

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <button
        className="w-full flex justify-between items-center gap-3 px-4 py-3 rounded-lg text-sm border-yellow-300 border-2 disabled:opacity-70"
        onClick={() => handleKakaoLoginBtnClick()}
        disabled={isWaitingTalk}
        style={{ background: "#FEE500", color: "black" }}
      >
        <img src={kakaoIcon} className="w-4 h-4" />
        <div className="flex-grow">
          {isWaitingTalk ? "카카오톡에서 로그인해 주세요..." : "카카오로 시작하기"}
        </div>
      </button>
      {isWaitingTalk && (
        <button
          className="text-xs text-gray-500 underline"
          onClick={onClickCancelWaiting}
        >
          취소
        </button>
      )}
      {isTimeout && (
        <p className="text-xs text-gray-500">
          로그인이 완료되지 않았어요. 다시 시도해 주세요.
        </p>
      )}
    </div>
  );
};

export default KakaoLoginBtn;
