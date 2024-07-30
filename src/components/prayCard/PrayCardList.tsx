import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import useBaseStore from "@/stores/baseStore";
import PrayCardUI from "./PrayCardUI";
import { useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { getISOTodayDate } from "@/lib/utils";
import { KakaoShareButton } from "../KakaoShareBtn";
import TodayPrayEndCard from "../todayPray/TodayPrayEndCard";

interface PrayCardListProps {
  currentUserId: string;
  groupId: string | undefined;
}

const PrayCardList: React.FC<PrayCardListProps> = ({
  currentUserId,
  groupId,
}) => {
  const groupPrayCardList = useBaseStore((state) => state.groupPrayCardList);
  const fetchGroupPrayCardList = useBaseStore(
    (state) => state.fetchGroupPrayCardList
  );
  const prayCardCarouselApi = useBaseStore(
    (state) => state.prayCardCarouselApi
  );
  const setPrayCardCarouselApi = useBaseStore(
    (state) => state.setPrayCardCarouselApi
  );

  const startDt = getISOTodayDate(-6);
  const endDt = getISOTodayDate(1);

  useEffect(() => {
    // TODO: 초기화 이후에 재랜더링 필요(useEffect 무한 로딩 고려)
    fetchGroupPrayCardList(groupId, startDt, endDt);
    prayCardCarouselApi?.on("select", () => {
      const currentIndex = prayCardCarouselApi.selectedScrollSnap();
      const carouselLength = prayCardCarouselApi.scrollSnapList().length;
      if (currentIndex === 0) prayCardCarouselApi.scrollNext();
      if (currentIndex === carouselLength - 1) prayCardCarouselApi.scrollPrev();
    });
  }, [prayCardCarouselApi, fetchGroupPrayCardList, groupId, startDt, endDt]);

  if (!groupPrayCardList) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  if (groupPrayCardList.length == 1) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center gap-4">
        <div>
          <p>아직 그룹원들이 기도제목을 작성하지 않았어요</p>
          <p>그룹원들의 기도를 독려해봐요</p>
        </div>

        <KakaoShareButton
          groupPageUrl={window.location.href}
          message="그룹원 기도 독려하기"
          id="prayCardListNull"
        />
      </div>
    );
  }

  return (
    <Carousel
      setApi={setPrayCardCarouselApi}
      opts={{
        startIndex: 1,
      }}
    >
      <CarouselContent>
        <CarouselItem className="basis-5/6"></CarouselItem>
        {groupPrayCardList
          ?.filter((prayCard) => prayCard.user_id !== currentUserId)
          .map((prayCard) => (
            <CarouselItem key={prayCard.id} className="basis-5/6 h-screen">
              <PrayCardUI currentUserId={currentUserId} prayCard={prayCard} />
            </CarouselItem>
          ))}
        <CarouselItem className="basis-5/6">
          <TodayPrayEndCard />
        </CarouselItem>
        <CarouselItem className="basis-5/6"></CarouselItem>
      </CarouselContent>
    </Carousel>
  );
};

export default PrayCardList;
