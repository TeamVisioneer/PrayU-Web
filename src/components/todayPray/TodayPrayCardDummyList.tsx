import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import DummyPrayCardUI from "../prayCard/DummyPrayCardUI";
import useBaseStore from "@/stores/baseStore";
import TodayPrayDummyCompletedItem from "./TodayPrayDummyCompletedItem";
import { useEffect } from "react";

const TodayPrayCardDummyList = () => {
  const prayCardCarouselApi = useBaseStore(
    (state) => state.prayCardCarouselApi
  );
  const setPrayCardCarouselIndex = useBaseStore(
    (state) => state.setPrayCardCarouselIndex
  );
  const setPrayCardCarouselApi = useBaseStore(
    (state) => state.setPrayCardCarouselApi
  );
  const isPrayToday = useBaseStore((state) => state.isPrayToday);

  useEffect(() => {
    prayCardCarouselApi?.on("select", () => {
      const currentIndex = prayCardCarouselApi.selectedScrollSnap();
      setPrayCardCarouselIndex(currentIndex);
      const carouselLength = prayCardCarouselApi.scrollSnapList().length;
      if (currentIndex === 0) prayCardCarouselApi.scrollNext();
      if (currentIndex === carouselLength - 1) {
        prayCardCarouselApi.scrollPrev();
      }
    });
  }, [prayCardCarouselApi, setPrayCardCarouselIndex]);

  return (
    <Carousel setApi={setPrayCardCarouselApi} opts={{ startIndex: 1 }}>
      <CarouselContent>
        <CarouselItem className="basis-5/6"></CarouselItem>
        <CarouselItem className="basis-5/6">
          <DummyPrayCardUI
            profileImage="/images/avatar/avatar_1.png"
            name="기도친구 1"
            content={`가족 모두가 건강하고 행복하게 지낼 수 있도록 기도해주세요.\n\n특히 부모님의 건강이 항상 좋기를 바랍니다.\n\n또한, 형제자매들이 서로 화목하게 지내며, 각자의 삶에서 성공과 기쁨을 누릴 수 있기를 기도합니다.`}
            dayOffset={0}
          />
        </CarouselItem>
        <CarouselItem className="basis-5/6">
          <DummyPrayCardUI
            profileImage="/images/avatar/avatar_2.png"
            name="기도친구 2"
            content={`직장에서 받는 스트레스를 잘 이겨낼 수 있도록 기도해주세요.\n\n업무가 순조롭게 진행되고, 마음의 평안을 찾을 수 있기를 바랍니다.\n\n동료들과의 관계가 원만하고, 상사와의 소통이 잘 이루어져서 직장 생활이 즐거울 수 있기를 기도합니다.`}
            dayOffset={6}
          />
        </CarouselItem>
        {isPrayToday && (
          <CarouselItem className="basis-5/6">
            <TodayPrayDummyCompletedItem />
          </CarouselItem>
        )}
        <CarouselItem className="basis-5/6"></CarouselItem>
      </CarouselContent>
    </Carousel>
  );
};

export default TodayPrayCardDummyList;
