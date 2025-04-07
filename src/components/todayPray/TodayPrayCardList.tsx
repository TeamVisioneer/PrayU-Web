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
import { PrayCardWithProfiles, Profiles } from "supabase/types/tables";

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

  const dummyPrayCard = {
    id: "1",
    user_id: "1",
    created_at: new Date().toISOString(),
    life: "(예시) 회사에서 업무적, 관계적으로 힘들었던 한 주",
    content:
      "(예시)맡겨진 자리에서 하나님의 사명을 발견할 수 있도록\n\n(예시)내 주변 사람을 내 몸과 같이 섬길 수 있도록",
    pray: [],
    profiles: {
      id: "1",
      full_name: "기도 카드",
      avatar_url: "/images/avatar/avatar_1.png",
    } as Profiles,
    bible_card_url: "",
    deleted_at: "",
    group_id: "",
    updated_at: "",
  } as PrayCardWithProfiles;

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
        {isPrayToday && (
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
