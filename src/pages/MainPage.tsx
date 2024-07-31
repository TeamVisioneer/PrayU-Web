import { useState, useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../supabase/client";
import useAuth from "../hooks/useAuth";
import { getDomainUrl } from "@/lib/utils";
import {
  Carousel,
  CarouselApi,
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

  const baseUrl = getDomainUrl();
  const from = location.state?.from?.pathname || "/group";
  const redirectUrl = `${baseUrl}${from}`;

  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);

  const handleDotsClick = (index: number) => {
    if (!api) return;
    setCurrentIndex(index);
    api.scrollTo(index);
  };

  const CarouselDots = () => (
    <div className="flex justify-center mt-4">
      {Array.from({ length: 3 }, (_, index) => (
        <span
          key={index}
          className={`h-2 w-2 mx-1 rounded-full cursor-pointer transition-colors duration-300 ${
            currentIndex === index ? "bg-gray-800" : "bg-gray-400"
          }`}
          onClick={() => handleDotsClick(index)}
        ></span>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-8 text-center">
      <div className="text-lg font-bold">우리만의 기도제목 기록공간 PrayU</div>
      <Carousel setApi={setApi}>
        <CarouselContent>
          <CarouselItem className="flex flex-col items-center gap-4">
            <div className="h-[300px] flex flex-col  items-center">
              <img
                className="h-full"
                src="https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/MainPageIntro1.png"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-lg font-bold">1. 기도제목 나누기</p>
              <div>
                <p className="text-sm text-gray-500">PrayU 는 그룹 내에서</p>
                <p className="text-sm text-gray-500">
                  함께 기도제목을 공유하는 공간이에요
                </p>
              </div>
            </div>
          </CarouselItem>
          <CarouselItem className="flex flex-col items-center gap-4">
            <div className="h-[300px]  flex flex-col  items-center ">
              <img
                className="h-full"
                src="https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/MainPageIntro2.png"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-lg font-bold">2. 오늘의 기도</p>
              <div>
                <p className="text-sm text-gray-500">
                  일주일 동안 기도제목을 서로
                </p>
                <p className="text-sm text-gray-500">
                  확인하고 반응할 수 있어요
                </p>
              </div>
            </div>
          </CarouselItem>
          <CarouselItem className="flex flex-col items-center gap-4">
            <div className="h-[300px] flex flex-col  items-center ">
              <img
                className="h-full"
                src="https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/MainPageIntro3.png"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-lg font-bold"> 3. 나에게 기도해준 사람 보기</p>
              <div>
                <p className="text-sm text-gray-500">
                  작성한 기도제목은 오늘의 기도에 올라가요
                </p>
                <p className="text-sm text-gray-500">
                  나에게 기도해준 사람도 확인할 수 있어요
                </p>
              </div>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselDots />
      </Carousel>

      <Auth
        redirectTo={redirectUrl}
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          style: {
            button: { background: "#FFE237", color: "black" },
            container: { width: "80%", margin: "0 auto" },
          },
        }}
        localization={{
          variables: {
            sign_in: {
              social_provider_text: "카카오 로그인",
            },
            sign_up: {
              social_provider_text: "카카오 로그인",
            },
          },
        }}
        onlyThirdPartyProviders={true}
        providers={["kakao"]}
      />
    </div>
  );
};

export default MainPage;
