import kakaoIcon from "@/assets/kakaoIcon.svg";
import { analyticsTrack } from "@/analytics/analytics";
import * as Sentry from "@sentry/react";
import { supabase } from "../../../supabase/client";

interface KakaoLoginBtnProps {
  redirectUrl: string;
}

// 카카오톡 앱 원탭 발사(#511)는 스파이크 결과 복귀 문제(카카오톡 인앱브라우저에
// 세션이 갇힘)로 임시 비활성 — 전원 웹 플로우. 원탭은 PKCE + 신버전 앱(딥링크
// 복귀)과 한 묶음으로 재도입한다. 설계·발사 URL 포맷 보존:
// PrayU-App/docs/plans/kakao-app-switch-restore.md ("최종 설계")
const KakaoLoginBtn: React.FC<KakaoLoginBtnProps> = ({ redirectUrl }) => {
  const handleKakaoLoginBtnClick = async () => {
    analyticsTrack("클릭_카카오_로그인", { where: "KakaoLoginBtn" });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: redirectUrl,
      },
    });
    if (error) {
      console.error("Kakao login error:", error.message);
      Sentry.captureException(error.message);
    }
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
