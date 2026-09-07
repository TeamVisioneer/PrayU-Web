import { useState } from "react";
import { PulseLoader } from "react-spinners";
import kakaoIcon from "@/assets/kakaoIcon.svg";
import { analyticsTrack } from "@/analytics/analytics";
import * as Sentry from "@sentry/react";
import { supabase } from "../../../supabase/client";
import {
  buildAndroidTalkIntent,
  buildTalkLaunchUrl,
  canLaunchKakaoTalk,
  isAndroid,
} from "@/lib/kakaoTalkLaunch";
import {
  claimSession,
  clearHandoffMarker,
  createHandoffPair,
  markHandoffStarted,
  resolveAuthorize,
} from "@/lib/authHandoff";

interface KakaoLoginBtnProps {
  redirectUrl: string;
}

// 모바일이면 카카오톡 앱 원탭 발사 + 세션 핸드오프 릴레이로 이 탭에 로그인.
// 그 외/실패는 기존 웹 리다이렉트. 설계: docs/plans/kakao-login-handoff.md
const KakaoLoginBtn: React.FC<KakaoLoginBtnProps> = ({ redirectUrl }) => {
  const [isWaitingTalk, setIsWaitingTalk] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);

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

    // Android 는 kauth authorize 파라미터가 필요 — 서버가 302 Location 을 대신 읽어 준다.
    // 실패하면 원탭을 포기하고 웹 플로우 (docs/plans/kakao-android-onetap.md)
    let launchUrl: string;
    if (isAndroid()) {
      const resolved = await resolveAuthorize(redirectTo.toString());
      if (!resolved) return webRedirectLogin();
      launchUrl = buildAndroidTalkIntent(resolved, data.url);
    } else {
      launchUrl = buildTalkLaunchUrl(data.url, data.url);
    }

    // ② 같은 탭 폴백(톡 미설치 → 웹 플로우 진행) 대비 개시 마커
    markHandoffStarted();
    setIsTimeout(false);
    setIsWaitingTalk(true);
    window.location.href = launchUrl;

    // ③ 카카오톡에서 로그인이 완결되면 릴레이로 토큰 수령 → 이 탭에 세션 확립
    const tokens = await claimSession(secret);
    if (!tokens) {
      setIsWaitingTalk(false);
      setIsTimeout(true);
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
    // 앱(WebView)이면 탭 햅틱 (ReactionBtn 과 동일 브리지)
    if (window.flutter_inappwebview?.callHandler) {
      window.flutter_inappwebview.callHandler(
        "triggerHapticFeedback",
        "mediumImpact",
      );
    }
    if (canLaunchKakaoTalk()) await talkLaunchLogin();
    else await webRedirectLogin();
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
        <div className="flex-grow flex justify-center">
          {isWaitingTalk ? (
            <PulseLoader color="#020202" size={10} />
          ) : (
            "카카오로 시작하기"
          )}
        </div>
      </button>
      {isTimeout && (
        <p className="text-xs text-gray-500">
          로그인이 완료되지 않았어요. 다시 시도해 주세요.
        </p>
      )}
      {/* 원탭이 완결되지 않으면 갇히지 않도록 웹 플로우 탈출구 (2026-09-06 사고의 안전장치) */}
      {isTimeout && (
        <button
          type="button"
          onClick={() => {
            analyticsTrack("클릭_카카오_로그인_웹폴백", { where: "KakaoLoginBtn" });
            webRedirectLogin();
          }}
          className="text-xs text-gray-500 underline underline-offset-2"
        >
          카카오 계정으로 로그인
        </button>
      )}
    </div>
  );
};

export default KakaoLoginBtn;
