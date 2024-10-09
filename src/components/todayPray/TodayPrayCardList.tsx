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

  const todayDt = getISOTodayDate();
  const filterdGroupPrayCardList = groupPrayCardList
    .filter(
      (prayCard) =>
        prayCard.user_id &&
        prayCard.pray?.filter((pray) => pray.created_at >= todayDt).length ==
          0 &&
        !myMember.profiles.blocking_users.includes(prayCard.user_id)
    )
    .sort((prayCard) => (prayCard.user_id === myMember.user_id ? -1 : 1));

  return (
    <Carousel setApi={setPrayCardCarouselApi} opts={{ startIndex: 1 }}>
      <CarouselContent>
        <CarouselItem className="basis-5/6"></CarouselItem>
        {filterdGroupPrayCardList?.map((prayCard) => (
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
              name="기도친구 1"
              content={`가족 모두가 건강하고 행복하게 지낼 수 있도록 기도해주세요.\n\n특히 부모님의 건강이 항상 좋기를 바랍니다.\n\n또한, 형제자매들이 서로 화목하게 지내며, 각자의 삶에서 성공과 기쁨을 누릴 수 있기를 기도합니다.`}
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
