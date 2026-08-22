import kakaoIcon from "@/assets/kakaoIcon.svg";
import { analyticsTrack } from "@/analytics/analytics";
import * as Sentry from "@sentry/react";
import { supabase } from "../../../supabase/client";
import { buildTalkLaunchUrl, canLaunchKakaoTalk } from "@/lib/kakaoTalkLaunch";

interface KakaoLoginBtnProps {
  redirectUrl: string;
}

const KakaoLoginBtn: React.FC<KakaoLoginBtnProps> = ({ redirectUrl }) => {
  const handleKakaoLoginBtnClick = async () => {
    analyticsTrack("클릭_카카오_로그인", { where: "KakaoLoginBtn" });
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: redirectUrl,
        // 리다이렉트를 우리가 수행: 모바일이면 카카오톡 앱 전환(원탭)을 먼저 시도
        skipBrowserRedirect: true,
      },
    });
    if (error || !data?.url) {
      console.error("Kakao login error:", error?.message);
      Sentry.captureException(
        error?.message ?? "kakao signInWithOAuth: no url",
      );
      return;
    }
    // 카카오톡 전환 가능 환경이면 앱 발사(미설치 폴백 내장), 아니면 기존 웹 리다이렉트
    window.location.href = canLaunchKakaoTalk()
      ? buildTalkLaunchUrl(data.url, data.url)
      : data.url;
  };

  return (
    <button
      className="w-full flex justify-between items-center gap-3 px-4 py-3 rounded-lg text-sm border-yellow-300 border-2"
      onClick={() => handleKakaoLoginBtnClick()}
      style={{ background: "#FEE500", color: "black" }}
    >
      <img src={kakaoIcon} className="w-4 h-4" />
      <div className="flex-grow">카카오로 시작하기</div>
    </button>
  );
};

export default KakaoLoginBtn;
