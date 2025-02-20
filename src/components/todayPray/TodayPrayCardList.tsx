import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import TodayPrayCompletedItem from "./TodayPrayCompletedItem";
import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";
import TodayPrayInviteCompletedItem from "./TodayPrayInviteCompletedItem";
import DummyPrayCardUI from "../prayCard/DummyPrayCardUI";
import PrayCardUI from "../prayCard/PrayCardUI";
import ReactionWithCalendar from "../prayCard/ReactionWithCalendar";
import DumyReactionBtnWithCalendar from "../prayCard/DummyReactionWithCalendar";
import MyPrayCardUI from "../prayCard/MyPrayCardUI";

const TodayPrayCardList = () => {
  const user = useBaseStore((state) => state.user);
  const setPrayCardCarouselApi = useBaseStore(
    (state) => state.setPrayCardCarouselApi
  );
  const prayCardCarouselApi = useBaseStore(
    (state) => state.prayCardCarouselApi
  );
  const setPrayCardCarouselIndex = useBaseStore(
    (state) => state.setPrayCardCarouselIndex
  );
  const prayCardCarouselList = useBaseStore(
    (state) => state.prayCardCarouselList
  );
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

  return (
    <Carousel
      className="flex flex-col"
      setApi={setPrayCardCarouselApi}
      opts={{ startIndex: 1 }}
    >
      <CarouselContent className="min-h-80vh max-h-80vh">
        <CarouselItem className="basis-5/6"></CarouselItem>
        {memberList?.length == 1 && (
          <CarouselItem className="basis-5/6 flex flex-col gap-4 pb-5">
            <DummyPrayCardUI
              profileImage="/images/avatar/avatar_1.png"
              name="기도 카드"
              content={`PrayU에서 사용하는 기도카드입니다\n기도카드를 통해 친구들의 기도제목을 한눈에 보아요!\n\n(예시)\n1. PrayU를 통해 많은 사람들이 기도할 수 있도록\n2. 모든 그룹이 진심으로 서로를 위한 기도에 참여하고, 사랑과 이해로 기도 요청을 응답할 수 있도록\n3. PrayU가 하나님 안에서 운영되는 서비스가 될 수 있도록 기도해주세요 🙏🏻`}
            />
            <DumyReactionBtnWithCalendar />
          </CarouselItem>
        )}
        {prayCardCarouselList?.map((prayCard) => (
          <CarouselItem
            key={prayCard.id}
            className="basis-5/6 flex flex-col gap-4 pb-5"
          >
            {prayCard.user_id == user?.id ? (
              <MyPrayCardUI prayCard={prayCard} />
            ) : (
              <PrayCardUI prayCard={prayCard} />
            )}
            <ReactionWithCalendar
              prayCard={prayCard}
              eventOption={{
                where: "TodayPrayCardListDrawer",
                total_member: prayCardCarouselList?.length || 0,
              }}
            />
          </CarouselItem>
        ))}
        {isPrayToday && (
          <CarouselItem className="basis-5/6 flex-grow pb-10">
            {memberList?.length == 1 ? (
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
