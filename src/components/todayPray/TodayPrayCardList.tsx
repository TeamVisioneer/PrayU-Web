import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import PrayCardUI from "./TodayPrayCardUI";
import TodayPrayCompletedItem from "./TodayPrayCompletedItem";
import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";
import { getISOTodayDate } from "@/lib/utils";

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
  const user = useBaseStore((state) => state.user);
  const myMember = useBaseStore((state) => state.myMember);
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

  if (!myMember || !groupPrayCardList) return null;

  const todayDt = getISOTodayDate();
  const filterdGroupPrayCardList = groupPrayCardList.filter(
    (prayCard) =>
      prayCard.user_id &&
      prayCard.user_id !== user!.id &&
      prayCard.pray?.filter((pray) => pray.created_at >= todayDt).length == 0 &&
      !myMember.profiles.blocking_users.includes(prayCard.user_id)
  );

  return (
    <Carousel setApi={setPrayCardCarouselApi} opts={{ startIndex: 1 }}>
      <CarouselContent>
        <CarouselItem className="basis-5/6"></CarouselItem>
        {filterdGroupPrayCardList?.map((prayCard, index) => (
          <CarouselItem key={prayCard.id} className="basis-5/6">
            <PrayCardUI
              prayCard={prayCard}
              listLength={filterdGroupPrayCardList.length}
              listIndex={index}
              eventOption={{ where: "PrayCardList" }}
            />
          </CarouselItem>
        ))}
        {isPrayToday && (
          <CarouselItem className="basis-5/6">
            <TodayPrayCompletedItem />
          </CarouselItem>
        )}
        <CarouselItem className="basis-5/6"></CarouselItem>
      </CarouselContent>
    </Carousel>
  );
};

export default TodayPrayCardList;
