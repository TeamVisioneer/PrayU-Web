import * as Sentry from "@sentry/react";
import { supabase } from "../../../supabase/client";
import appleIcon from "@/assets/appleIcon.svg";
import { analyticsTrack } from "@/analytics/analytics";

interface AppleLoginBtnProps {
  redirectUrl: string;
}

const AppleLoginBtn: React.FC<AppleLoginBtnProps> = ({ redirectUrl }) => {
  const handleAppleLoginBtnClick = async () => {
    analyticsTrack("클릭_애플_로그인", { where: "AppleLoginBtn" });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: redirectUrl,
      },
    });
    if (error) {
      console.error("Apple login error:", error.message);
      Sentry.captureException(error.message);
    }
  };

  return (
    <button
      className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm border-gray-700 border-2"
      onClick={handleAppleLoginBtnClick}
      style={{ background: "#222222", color: "white" }}
    >
      <img src={appleIcon} className="w-4 h-4" />
      <div className="flex-grow">Apple로 시작하기</div>
    </button>
  );
};

export default AppleLoginBtn;
