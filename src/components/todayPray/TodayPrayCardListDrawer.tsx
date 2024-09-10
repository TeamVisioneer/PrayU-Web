import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import useBaseStore from "@/stores/baseStore";
import PrayCardUI from "./TodayPrayCardUI";
import { useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { getISOTodayDate } from "@/lib/utils";
import { KakaoShareButton } from "../share/KakaoShareBtn";
import MyMemberBtn from "../member/MyMemberBtn";
import { PrayTypeDatas } from "@/Enums/prayType";
import OpenContentDrawerBtn from "../share/OpenContentDrawerBtn";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface PrayCardListProps {
  currentUserId: string;
  groupId: string;
}

const TodayPrayCardListDrawer: React.FC<PrayCardListProps> = ({
  currentUserId,
  groupId,
}) => {
  const myMember = useBaseStore((state) => state.myMember);
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const groupPrayCardList = useBaseStore((state) => state.groupPrayCardList);
  const fetchGroupPrayCardList = useBaseStore(
    (state) => state.fetchGroupPrayCardList
  );

  const isOpenTodayPrayDrawer = useBaseStore(
    (state) => state.isOpenTodayPrayDrawer
  );
  const setIsOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setIsOpenTodayPrayDrawer
  );

  const prayCardCarouselApi = useBaseStore(
    (state) => state.prayCardCarouselApi
  );
  const setPrayCardCarouselApi = useBaseStore(
    (state) => state.setPrayCardCarouselApi
  );

  const startDt = getISOTodayDate(-6);
  const endDt = getISOTodayDate(1);
  const todayDt = getISOTodayDate();

  useEffect(() => {
    fetchGroupPrayCardList(groupId, currentUserId, startDt, endDt);

    prayCardCarouselApi?.on("select", () => {
      const currentIndex = prayCardCarouselApi.selectedScrollSnap();
      const carouselLength = prayCardCarouselApi.scrollSnapList().length;
      if (currentIndex === 0) prayCardCarouselApi.scrollNext();
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

  if (!myMember) return null;
  if (!groupPrayCardList)
    return (
      <div className="flex justify-center items-center min-h-80vh max-h-80vh">
        <ClipLoader size={20} color={"#70AAFF"} loading={true} />
      </div>
    );

  const filterdGroupPrayCardList = groupPrayCardList?.filter(
    (prayCard) =>
      prayCard.user_id &&
      prayCard.user_id !== currentUserId &&
      prayCard.pray?.filter((pray) => pray.created_at >= todayDt).length == 0 &&
      !myMember.profiles.blocking_users.includes(prayCard.user_id)
  );

  const emptyPrayCardList = (
    <div className="flex flex-col justify-center items-center px-10 gap-4">
      <p className="text-lg font-bold">아직 올라온 기도제목이 없어요 😭</p>
      <div className="h-[300px] flex flex-col items-center">
        <img
          className="h-full rounded-md"
          src="/images/KakaoShareMessage.png"
        />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-500">
          친구들과 함께 오늘의 기도를 시작해 보아요:)
        </p>
      </div>
      <KakaoShareButton
        targetGroup={targetGroup}
        message="카카오톡으로 초대하기"
        eventOption={{ where: "PrayCardList" }}
      ></KakaoShareButton>
    </div>
  );

  const completedItem = (
    <div className="flex flex-col gap-4 justify-center items-center min-h-80vh max-h-80vh pb-10">
      <img
        src={PrayTypeDatas["pray"].img}
        alt={PrayTypeDatas["pray"].emoji}
        className="w-16 h-16 opacity-100"
      />
      <h1 className="font-bold text-xl">오늘의 기도 완료!</h1>
      <h3 className="text-gray-600">내일도 기도해 주실 거죠? 🤗</h3>
      <div className="text-gray-400 text-center">
        <h1>당신을 위해 기도한</h1>
        <h1>친구들을 확인해 보아요</h1>
      </div>
      <MyMemberBtn />
      <OpenContentDrawerBtn />
    </div>
  );

  const todayPrayCardList = (
    <Carousel
      setApi={setPrayCardCarouselApi}
      opts={{
        startIndex: 1,
      }}
    >
      <CarouselContent>
        <CarouselItem className="basis-5/6"></CarouselItem>
        {filterdGroupPrayCardList.map((prayCard) => (
          <CarouselItem key={prayCard.id} className="basis-5/6">
            <PrayCardUI
              prayCard={prayCard}
              eventOption={{ where: "PrayCardList" }}
            />
          </CarouselItem>
        ))}
        <CarouselItem className="basis-5/6">{completedItem}</CarouselItem>
        <CarouselItem className="basis-5/6"></CarouselItem>
      </CarouselContent>
    </Carousel>
  );

  return (
    <Drawer
      open={isOpenTodayPrayDrawer}
      onOpenChange={setIsOpenTodayPrayDrawer}
    >
      <DrawerContent className="bg-mainBg max-w-[480px] mx-auto w-full pb-5">
        <DrawerHeader className="p-2">
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        {groupPrayCardList.length === 1 ? emptyPrayCardList : todayPrayCardList}
      </DrawerContent>
    </Drawer>
  );
};

export default TodayPrayCardListDrawer;
