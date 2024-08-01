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
import MyMemberBtn from "../todayPray/MyMemberBtn";
import { PrayTypeDatas } from "@/Enums/prayType";
import { analyticsTrack } from "@/analytics/analytics";

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

  const completedItem = (
    <div className="flex flex-col gap-4 justify-center items-center pt-10">
      <img
        src={PrayTypeDatas["pray"].img}
        alt={PrayTypeDatas["pray"].emoji}
        className="w-16 h-16 opacity-100"
      />
      <h1 className="font-bold text-xl">오늘의 기도 완료</h1>
      <div className="text-gray-400 text-center">
        <h1>당신을 위해 기도한</h1>
        <h1>사람들을 확인해보세요</h1>
      </div>
      <MyMemberBtn />
    </div>
  );

  useEffect(() => {
    // TODO: 초기화 이후에 재랜더링 필요(useEffect 무한 로딩 고려)
    fetchGroupPrayCardList(groupId, currentUserId, startDt, endDt);
    prayCardCarouselApi?.on("select", () => {
      const currentIndex = prayCardCarouselApi.selectedScrollSnap();
      const carouselLength = prayCardCarouselApi.scrollSnapList().length;

      if (currentIndex === 0) prayCardCarouselApi.scrollNext();
      if (currentIndex === carouselLength - 2) {
        analyticsTrack("클릭_오늘의기도_완료", {
          group_id: groupId,
          index: currentIndex,
        });
      }
      if (currentIndex === carouselLength - 1) {
        prayCardCarouselApi.scrollPrev();
      }
    });
  }, [
    prayCardCarouselApi,
    fetchGroupPrayCardList,
    groupId,
    currentUserId,
    startDt,
    endDt,
  ]);

  if (!groupPrayCardList) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  // TODO: member 가 아예 없는 경우와 기도카드가 올라오지 않은 경우
  if (groupPrayCardList.length == 1) {
    return (
      <div className="flex flex-col justify-center items-center p-10 gap-4">
        <div className="h-[300px] flex flex-col items-center">
          <img
            className="h-full rounded-md"
            src="https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/KakaoShare.png"
          />
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">아직 올라온 기도카드가 없어요</p>
          <p className="text-sm text-gray-500">
            그룹원과 같이 오늘의 기도를 시작해 보아요
          </p>
        </div>
        <KakaoShareButton
          groupPageUrl={window.location.href}
          id="paryTodayIntro"
          message="카카오톡으로 초대하기"
        ></KakaoShareButton>
      </div>
    );
  }

  const todayDt = getISOTodayDate();
  const filterdGroupPrayCardList = groupPrayCardList?.filter(
    (prayCard) =>
      prayCard.user_id !== currentUserId &&
      prayCard.pray?.filter((pray) => pray.created_at >= todayDt).length === 0
  );
  return (
    <Carousel
      setApi={setPrayCardCarouselApi}
      opts={{
        startIndex: 1,
      }}
    >
      <CarouselContent>
        <CarouselItem className="basis-5/6"></CarouselItem>
        {filterdGroupPrayCardList.map((prayCard) => (
          <CarouselItem key={prayCard.id} className="basis-5/6 h-screen">
            <PrayCardUI
              currentUserId={currentUserId}
              prayCard={prayCard}
              where="PrayCardList"
            />
          </CarouselItem>
        ))}
        <CarouselItem className="basis-5/6">{completedItem}</CarouselItem>
        <CarouselItem className="basis-5/6"></CarouselItem>
      </CarouselContent>
    </Carousel>
  );
};

export default PrayCardList;
