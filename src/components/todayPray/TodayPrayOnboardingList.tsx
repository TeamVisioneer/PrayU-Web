import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import DummyPrayCardUI from "../prayCard/DummyPrayCardUI";
import { PrayTypeDatas } from "@/Enums/prayType";
import { useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import { Button } from "../ui/button";

const TodayPrayCardOnboardingList = () => {
  const setPrayCardCarouselApi = useBaseStore(
    (state) => state.setPrayCardCarouselApi
  );
  const setIsPrayToday = useBaseStore((state) => state.setIsPrayToday);
  const prayCardCarouselApi = useBaseStore(
    (state) => state.prayCardCarouselApi
  );

  useEffect(() => {
    prayCardCarouselApi?.on("select", () => {
      const currentIndex = prayCardCarouselApi.selectedScrollSnap();
      const carouselLength = prayCardCarouselApi.scrollSnapList().length;
      if (currentIndex === 0) prayCardCarouselApi.scrollNext();
      if (currentIndex === carouselLength - 2) setIsPrayToday(true);
      if (currentIndex === carouselLength - 1) prayCardCarouselApi.scrollPrev();
    });
  }, [prayCardCarouselApi, setIsPrayToday]);

  const completedItem = (
    <div className="flex flex-col gap-4 justify-center items-center min-h-80vh max-h-80vh pb-10">
      <img
        src={PrayTypeDatas["pray"].img}
        alt={PrayTypeDatas["pray"].emoji}
        className="w-16 h-16 opacity-100"
      />
      <h1 className="font-bold text-xl">오늘의 기도 완료!</h1>
      <div className="text-gray-400 text-center">
        <h1>그룹원들과 기도제목을 공유하고</h1>
        <h1>매일 서로를 위해 기도해요</h1>
      </div>
      <Button
        className="w-40"
        variant="primary"
        onClick={() => {
          window.location.href = "/group/create";
        }}
      >
        그룹 만들기
      </Button>
    </div>
  );

  return (
    <Carousel setApi={setPrayCardCarouselApi} opts={{ startIndex: 1 }}>
      <CarouselContent>
        <CarouselItem className="basis-5/6"></CarouselItem>
        <CarouselItem className="basis-5/6">
          <DummyPrayCardUI
            profileImage=""
            name="기도친구 1"
            content={`가족 모두가 건강하고 행복하게 지낼 수 있도록 기도해주세요.\n\n특히 부모님의 건강이 항상 좋기를 바랍니다.\n\n또한, 형제자매들이 서로 화목하게 지내며, 각자의 삶에서 성공과 기쁨을 누릴 수 있기를 기도합니다.`}
          />
        </CarouselItem>
        <CarouselItem className="basis-5/6">
          <DummyPrayCardUI
            profileImage=""
            name="기도친구 2"
            content={`직장에서 받는 스트레스를 잘 이겨낼 수 있도록 기도해주세요.\n\n업무가 순조롭게 진행되고, 마음의 평안을 찾을 수 있기를 바랍니다.\n\n동료들과의 관계가 원만하고, 상사와의 소통이 잘 이루어져서 직장 생활이 즐거울 수 있기를 기도합니다.`}
          />
        </CarouselItem>
        <CarouselItem className="basis-5/6">
          <DummyPrayCardUI
            profileImage=""
            name="기도친구 3"
            content={`친구의 병이 빨리 낫도록 기도해주세요.\n\n치료가 잘 되어 건강을 회복하고, 다시 일상으로 돌아올 수 있기를 바랍니다.\n\n친구가 힘든 시간을 잘 이겨내고, 가족과 친구들의 사랑과 지지를 받으며 회복할 수 있기를 기도합니다.`}
          />
        </CarouselItem>
        <CarouselItem className="basis-5/6">{completedItem}</CarouselItem>
        <CarouselItem className="basis-5/6"></CarouselItem>
      </CarouselContent>
    </Carousel>
  );
};

export default TodayPrayCardOnboardingList;
