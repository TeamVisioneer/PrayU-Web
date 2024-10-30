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
      className="flex justify-center items-center w-9 h-9 rounded-full"
      onClick={handleAppleLoginBtnClick}
      style={{ background: "#222222", color: "white" }}
    >
      <img src={appleIcon} className="w-[0.9rem] h-[0.9rem]" />
    </button>
  );
};

export default AppleLoginBtn;
