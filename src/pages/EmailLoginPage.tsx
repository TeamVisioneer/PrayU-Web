import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../supabase/client";
import { useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";

const EmailLoginPage = () => {
  const user = useBaseStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/auth/redirect");
    }
  }, [user, navigate]);

  return (
    <div className="w-full flex-col justify-between items-center">
      <div className="flex w-full items-center justify-between">
        <div className="w-[60px]">
          <IoChevronBack size={20} onClick={() => window.history.back()} />
        </div>
        <p className="text-xl font-bold">PrayU 로그인</p>
        <span className="w-[60px]"></span>
      </div>

      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]}
      />
    </div>
  );
};

export default EmailLoginPage;
