import React from "react";
import { Auth } from "@supabase/auth-ui-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../supabase/client";
import useAuth from "../hooks/useAuth";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const MainPage: React.FC = () => {
  const { user } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  if (user) {
    navigate("/group", { replace: true });
  }

  const from = location.state?.from?.pathname || "/group";
  const redirectUrl = `${import.meta.env.VITE_BASE_URL}${from}`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2  ">
        <div className="text-lg font-bold">
          우리만의 기도제목 기록공간, PrayU
        </div>
        <div className="text-sm text-gray-500">
          매일 기도하고 매일 반응하는 우리 공동체
        </div>
      </div>
      <Carousel>
        <CarouselContent className="aspect-square">
          <CarouselItem className=" bg-gray-500">
            <div className="bg-gray-400 aspect-square"></div>
          </CarouselItem>
          <CarouselItem className=" bg-gray-500">
            <div className="bg-gray-400 aspect-square"></div>
          </CarouselItem>
          <CarouselItem className=" bg-gray-500">
            <div className="bg-gray-400 aspect-square"></div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
      <Auth
        redirectTo={redirectUrl}
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        onlyThirdPartyProviders={true}
        providers={["kakao"]}
      />
    </div>
  );
};

export default MainPage;
