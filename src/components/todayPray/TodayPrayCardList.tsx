import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import TodayPrayCompletedItem from "./TodayPrayCompletedItem";
import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";
import TodayPrayInviteCompletedItem from "./TodayPrayInviteCompletedItem";
import PrayCard from "../prayCard/PrayCard";
import ReactionWithCalendar from "../prayCard/ReactionWithCalendar";
import DumyReactionBtnWithCalendar from "../prayCard/DummyReactionWithCalendar";
import { dummyPrayCard } from "@/mocks/dummyPrayCard";

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
  const prayCardCarouselList = useBaseStore(
    (state) => state.prayCardCarouselList
  );
  const memberList = useBaseStore((state) => state.memberList);
  const isPrayToday = useBaseStore((state) => state.isPrayToday);
  const hasPrayCardCurrentWeek = useBaseStore(
    (state) => state.hasPrayCardCurrentWeek
  );

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
      <CarouselContent className="min-h-70vh max-h-70vh">
        <CarouselItem className="basis-5/6"></CarouselItem>
        {memberList?.length == 1 && (
          <CarouselItem className="basis-5/6 flex flex-col gap-2">
            <PrayCard prayCard={dummyPrayCard} isMoreBtn={false} />
            <DumyReactionBtnWithCalendar />
          </CarouselItem>
        )}
        {prayCardCarouselList?.map((prayCard) => (
          <CarouselItem
            key={prayCard.id}
            className="basis-5/6 flex flex-col gap-2"
          >
            <PrayCard prayCard={prayCard} />
            <ReactionWithCalendar
              prayCard={prayCard}
              eventOption={{
                where: "TodayPrayCardListDrawer",
                total_member: prayCardCarouselList?.length || 0,
              }}
            />
          </CarouselItem>
        ))}
        {isPrayToday && hasPrayCardCurrentWeek && (
          <CarouselItem className="basis-5/6 flex-grow">
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
