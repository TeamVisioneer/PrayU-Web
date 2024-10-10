import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import PrayCardUI from "./TodayPrayCardUI";
import TodayPrayCompletedItem from "./TodayPrayCompletedItem";
import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";
import TodayPrayInviteCompletedItem from "./TodayPrayInviteCompletedItem";
import DummyPrayCardUI from "../prayCard/DummyPrayCardUI";

const TodayPrayCardList = () => {
  const setPrayCardCarouselApi = useBaseStore(
    (state) => state.setPrayCardCarouselApi
  );
  const prayCardCarouselApi = useBaseStore(
    (state) => state.prayCardCarouselApi
  );
  const setPrayCardCarouselIndex = useBaseStore(
    (state) => state.setPrayCardCarouselIndex
  );
  const groupPrayCardList = useBaseStore((state) => state.groupPrayCardList);
  const prayCardCarouselList = useBaseStore(
    (state) => state.prayCardCarouselList
  );
  const myMember = useBaseStore((state) => state.myMember);
  const memberList = useBaseStore((state) => state.memberList);
  const isPrayToday = useBaseStore((state) => state.isPrayToday);

  useEffect(() => {
    setPrayCardCarouselIndex(1);
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

  if (!myMember || !memberList || !groupPrayCardList) return null;

  return (
    <Carousel setApi={setPrayCardCarouselApi} opts={{ startIndex: 1 }}>
      <CarouselContent>
        <CarouselItem className="basis-5/6"></CarouselItem>
        {prayCardCarouselList.map((prayCard) => (
          <CarouselItem key={prayCard.id} className="basis-5/6">
            <PrayCardUI
              prayCard={prayCard}
              eventOption={{ where: "PrayCardList" }}
            />
          </CarouselItem>
        ))}
        {memberList.length == 1 && (
          <CarouselItem className="basis-5/6">
            <DummyPrayCardUI
              profileImage="/images/avatar/avatar_1.png"
              name="기도 친구"
              content={`1. 가족 모두가 건강하고 행복하게 지낼 수 있도록 기도해주세요.\n\n2. 직장에서의 삶이 버겁고 힘들 때가 많습니다. 순간마다 하나님을 먼저 찾고 기도와 말씀으로 이겨낼 수 있길 원합니다.\n\n3. 소그룹원들이 주일 예배와 그룹 모임에 참여하며 하나님의 말씀을 듣고 실천할 수 있길 기도합니다.`}
              dayOffset={2}
            />
          </CarouselItem>
        )}
        {isPrayToday && (
          <CarouselItem className="basis-5/6">
            {memberList.length == 1 ? (
              <TodayPrayInviteCompletedItem />
            ) : (
              <TodayPrayCompletedItem />
            )}
          </CarouselItem>
        )}
        <CarouselItem className="basis-5/6"></CarouselItem>
      </CarouselContent>
    </Carousel>
  );
};

export default TodayPrayCardList;
