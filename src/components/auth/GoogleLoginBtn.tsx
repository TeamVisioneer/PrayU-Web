import * as Sentry from "@sentry/react";
import { supabase } from "../../../supabase/client";
import googleIcon from "@/assets/googleIcon.svg";
import { analytics } from "@/analytics/analytics";

interface GoogleLoginBtnProps {
  redirectUrl: string;
}

const GoogleLoginBtn: React.FC<GoogleLoginBtnProps> = ({ redirectUrl }) => {
  const handleAppleLoginBtnClick = async () => {
    analytics.track("클릭_구글_로그인", { where: "GoogleLoginBtn" });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
    if (error) {
      console.error("Google login error:", error.message);
      Sentry.captureException(error.message);
    }
  };

  return (
    <button
      className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm border-white border-2"
      onClick={handleAppleLoginBtnClick}
      style={{ background: "white", color: "black" }}
    >
      <img src={googleIcon} className="w-4 h-4" />
      <div className="flex-grow">Google로 시작하기</div>
    </button>
  );
};

export default GoogleLoginBtn;
