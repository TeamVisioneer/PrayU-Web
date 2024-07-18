import React from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../supabase/client";
import useAuth from "../hooks/useAuth";

const MainPage: React.FC = () => {
  const { user } = useAuth();

  console.log(user?.id);
  return (
    <div>
      <Auth
        redirectTo={import.meta.env.VITE_BASE_URL}
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        onlyThirdPartyProviders={true}
        providers={["kakao"]}
      />
    </div>
  );
};

export default MainPage;
