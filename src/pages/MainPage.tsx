import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import useBaseStore from "@/stores/baseStore";
import { Button } from "@/components/ui/button";
import { analytics, analyticsTrack } from "@/analytics/analytics";
import TodayPrayOnboardingDrawer from "@/components/todayPray/TodayPrayOnboardingDrawer";

const MainPage: React.FC = () => {
  const user = useBaseStore((state) => state.user);
  const userLoading = useBaseStore((state) => state.userLoading);

  const setIsOpenOnboardingDrawer = useBaseStore(
    (state) => state.setIsOpenOnboardingDrawer
  );

  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);

  if (userLoading) {
    return null;
  }

  const handleDotsClick = (index: number) => {
    if (!api) return;
    setCurrentIndex(index);
    api.scrollTo(index);
    analyticsTrack("클릭_메인_캐러셀도트", { index });
  };

  const CarouselDots = () => (
    <div className="flex justify-center items-center mt-6">
      {Array.from({ length: 3 }, (_, index) => (
        <span
          key={index}
          className={`mx-1 rounded-full cursor-pointer transition-colors duration-300 ${
            currentIndex === index
              ? "w-[8px] h-[8px] bg-mainBtn"
              : "h-[6px] w-[6px] bg-gray-400"
          }`}
          onClick={() => handleDotsClick(index)}
        ></span>
      ))}
    </div>
  );

  const handlePrayUStartBtnClick = () => {
    analytics.track("클릭_메인_시작하기", { where: "PrayUStartBtn" });
    window.location.href = "/group";
  };

  const PrayUStartBtn = () => {
    return (
      <Button
        variant="primary"
        className="w-32"
        onClick={() => handlePrayUStartBtnClick()}
      >
        PrayU 시작하기
      </Button>
    );
  };

  const handlePrayUOnboardingClick = () => {
    analytics.track("클릭_메인_알아보기", { where: "PrayUOnboardingBtn" });
    setIsOpenOnboardingDrawer(true);
  };

  const PrayUOnboardingBtn = () => {
    return (
      <Button
        variant="primary"
        className="w-32"
        onClick={() => handlePrayUOnboardingClick()}
      >
        PrayU 알아보기
      </Button>
    );
  };

  return (
    <div className="flex flex-col gap-6 items-center text-center">
      <div className="text-lg font-bold">우리만의 기도제목 나눔 공간 PrayU</div>
      <Carousel setApi={setApi}>
        <CarouselContent>
          <CarouselItem className="flex flex-col items-center gap-4">
            <div className="h-[300px] flex flex-col  items-center">
              <img className="h-full" src="/images/MainPageIntro3.png" />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-lg font-bold">1. 기도제목 나눔</p>
              <div>
                <p className="text-sm text-gray-500">PrayU 는 그룹 내에서</p>
                <p className="text-sm text-gray-500">
                  함께 기도제목을 공유하는 공간이에요
                </p>
              </div>
            </div>
          </CarouselItem>
          <CarouselItem className="flex flex-col items-center gap-4">
            <div className="h-[300px] flex flex-col  items-center">
              <img className="h-full" src="/images/MainPageIntro2.png" />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-lg font-bold">2. 오늘의 기도</p>
              <div>
                <p className="text-sm text-gray-500">
                  오늘의 기도에서 서로의 기도제목을 확인해요
                </p>
                <p className="text-sm text-gray-500">
                  꾸준히 서로 반응하며 함께 기도해 보아요
                </p>
              </div>
            </div>
          </CarouselItem>
          <CarouselItem className="flex flex-col items-center gap-4">
            <div className="h-[300px] flex flex-col  items-center ">
              <img className="h-full" src="/images/MainPageIntro4.png" />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-lg font-bold"> 3. 내게 기도해 준 친구</p>
              <div>
                <p className="text-sm text-gray-500">
                  기도해 준 친구들을 확인할 수 있어요
                </p>
                <p className="text-sm text-gray-500">
                  일주일 동안 서로를 위해 기도해요
                </p>
              </div>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselDots />
      </Carousel>
      <div className="flex flex-col gap-4">
        {user ? <PrayUStartBtn /> : <PrayUOnboardingBtn />}
        {!user && (
          <a href="/login" className="text-sm text-gray-500 underline">
            이미 계정이 있어요
          </a>
        )}
      </div>
      <TodayPrayOnboardingDrawer />
    </div>
  );
};

export default MainPage;
