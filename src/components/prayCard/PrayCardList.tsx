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
      <h1 className="font-bold text-xl">기도 완료</h1>
      <div className="text-grayText text-center">
        <h1>당신의 기도제목을</h1>
        <h1>확인하세요</h1>
      </div>
      <MyMemberBtn />
    </div>
  );

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
        <CarouselItem className="basis-5/6">{completedItem}</CarouselItem>
        <CarouselItem className="basis-5/6"></CarouselItem>
      </CarouselContent>
    </Carousel>
  );
};

export default PrayCardList;
