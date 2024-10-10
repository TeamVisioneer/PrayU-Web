import kakaoIcon from "@/assets/kakaoIcon.svg";
import { analyticsTrack } from "@/analytics/analytics";
import * as Sentry from "@sentry/react";
import { getDomainUrl } from "@/lib/utils";

const KakaoLoginBtn: React.FC<> = ({ redirectGroupId }) => {
  const baseUrl = getDomainUrl();

  const handleKakaoLoginBtnClick = async () => {
    analyticsTrack("클릭_카카오_로그인", { where: "KakaoLoginBtn" });
    if (window?.Kakao?.Auth) {
      try {
        window?.Kakao.Auth.authorize({
          redirectUri: `${baseUrl}/auth/kakao/callback`,
          state: `groupId:${groupId}`,
        });
      } catch (error) {
        console.error("Kakao login error:", error);
        Sentry.captureException(error);
      }
    }
  };

  return (
    <button
      className="w-full flex justify-between items-center gap-3 px-4 py-2 rounded-lg text-sm border-yellow-300 border-2"
      onClick={() => handleKakaoLoginBtnClick()}
      style={{ background: "#FEE500", color: "black" }}
    >
      <img src={kakaoIcon} className="w-4 h-4" />
      <div className="flex-grow">카카오로 시작하기</div>
    </button>
  );
};

export default KakaoLoginBtn;
