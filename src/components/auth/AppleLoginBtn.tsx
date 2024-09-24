import * as Sentry from "@sentry/react";
import { supabase } from "../../../supabase/client";
import appleIcon from "@/assets/appleIcon.svg";
import { analytics } from "@/analytics/analytics";

interface AppleLoginBtnProps {
  redirectUrl: string;
}

const AppleLoginBtn: React.FC<AppleLoginBtnProps> = ({ redirectUrl }) => {
  const handleAppleLoginBtnClick = async () => {
    analytics.track("클릭_애플_로그인", { where: "AppleLoginBtn" });
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
      className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm"
      onClick={handleAppleLoginBtnClick}
      style={{ background: "#222222", color: "white" }}
    >
      <img src={appleIcon} className="w-4 h-4" />
      Apple로 시작하기
    </button>
  );
};

export default AppleLoginBtn;
