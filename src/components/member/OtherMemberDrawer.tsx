import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import useBaseStore from "@/stores/baseStore";
import PrayCardUI from "../prayCard/PrayCardUI";
import ReactionWithCalendar from "../prayCard/ReactionWithCalendar";
import { getISOOnlyDate, getISOTodayDate, isCurrentWeek } from "@/lib/utils";
import { ExpiredMemberLink, KakaoShareButton } from "../share/KakaoShareBtn";
import { getDateDistance } from "@toss/date";

const OtherMemberDrawer: React.FC = () => {
  const memberList = useBaseStore((state) => state.memberList);
  const isOpenOtherMemberDrawer = useBaseStore(
    (state) => state.isOpenOtherMemberDrawer
  );
  const setIsOpenOtherMemberDrawer = useBaseStore(
    (state) => state.setIsOpenOtherMemberDrawer
  );
  const otherPrayCardList = useBaseStore((state) => state.otherPrayCardList);

  const dateDistance = getDateDistance(
    new Date(getISOOnlyDate(otherPrayCardList?.[0]?.created_at || "")),
    new Date(getISOTodayDate())
  );

  const ExpiredSection = (
    <div className="flex flex-col items-center justify-center gap-4 pb-10">
      <div className="flex flex-col items-center gap-1">
        {dateDistance.days >= 7 ? (
          <p className="font-bold">
            작성 된 지 {dateDistance.days}일이 되었어요 😂
          </p>
        ) : (
          <p className="font-bold">기도제목이 만료되었어요 😂</p>
        )}
        <p className="text-sm text-gray-400">
          {otherPrayCardList?.[0]?.profiles.full_name}님에게 기도제목을 요청해
          보아요
        </p>
      </div>

      <KakaoShareButton
        className="w-48"
        buttonText="요청 메세지 보내기"
        kakaoLinkObject={ExpiredMemberLink()}
        eventOption={{ where: "ReactionWithCalendar" }}
      ></KakaoShareButton>
    </div>
  );

  const NoPrayCardSection = (
    <div className="flex flex-col items-center justify-center gap-4 pb-10">
      <div className="flex flex-col items-center gap-1">
        <p className="font-bold">기도카드가 만들어지지 않았어요 😂</p>
        <p className="text-sm">기도제목을 요청해 보아요!</p>
      </div>
      <KakaoShareButton
        className="w-48"
        buttonText="요청 메세지 보내기"
        kakaoLinkObject={ExpiredMemberLink()}
        eventOption={{ where: "ReactionWithCalendar" }}
      ></KakaoShareButton>
    </div>
  );

  return (
    <Drawer
      open={isOpenOtherMemberDrawer}
      onOpenChange={setIsOpenOtherMemberDrawer}
    >
      <DrawerContent className="bg-mainBg flex flex-col">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <div className="px-8 py-5 flex flex-col flex-grow min-h-80vh max-h-80vh gap-4">
          <PrayCardUI prayCard={otherPrayCardList?.[0]} />
          {!otherPrayCardList?.[0] ? (
            NoPrayCardSection
          ) : !isCurrentWeek(otherPrayCardList[0].created_at) ? (
            ExpiredSection
          ) : (
            <ReactionWithCalendar
              prayCard={otherPrayCardList?.[0]}
              eventOption={{
                where: "TodayPrayCardListDrawer",
                total_member: memberList?.length || 0,
              }}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default OtherMemberDrawer;
