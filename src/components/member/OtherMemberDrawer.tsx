import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import useBaseStore from "@/stores/baseStore";
import PrayCard from "../prayCard/PrayCard";
import ReactionWithCalendar from "../prayCard/ReactionWithCalendar";
import { getISOOnlyDate, getISOTodayDate, isCurrentWeek } from "@/lib/utils";
import { ExpiredMemberLink } from "../share/KakaoShareBtn";
import { getDateDistance } from "@toss/date";
import kakaoIcon from "@/assets/kakaoIcon.svg";
import { analyticsTrack } from "@/analytics/analytics";
import { NotificationType } from "../notification/NotificationType";
import { useToast } from "@/components/ui/use-toast";
import { RiNotification4Line } from "react-icons/ri";

const OtherMemberDrawer: React.FC = () => {
  const memberList = useBaseStore((state) => state.memberList);
  const otherMember = useBaseStore((state) => state.otherMember);
  const user = useBaseStore((state) => state.user);
  const isOpenOtherMemberDrawer = useBaseStore(
    (state) => state.isOpenOtherMemberDrawer
  );
  const setIsOpenOtherMemberDrawer = useBaseStore(
    (state) => state.setIsOpenOtherMemberDrawer
  );
  const otherPrayCardList = useBaseStore((state) => state.otherPrayCardList);
  const createNotification = useBaseStore((state) => state.createNotification);
  const createOnesignalPush = useBaseStore(
    (state) => state.createOnesignalPush
  );
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const { toast } = useToast();

  const dateDistance = getDateDistance(
    new Date(getISOOnlyDate(otherPrayCardList?.[0]?.created_at || "")),
    new Date(getISOTodayDate())
  );

  const onClickSendKakaoMessage = () => {
    if (window.Kakao && window.Kakao.Share) {
      analyticsTrack("클릭_카카오_공유", { where: "OtherMemberDrawer" });
      window.Kakao.Share.sendDefault(ExpiredMemberLink());
    }
  };

  const onClickSendNotificationRequest = async () => {
    if (!user || !otherMember?.user_id || !targetGroup) {
      toast({
        title: "알림 보내기 실패",
        description: "잘못된 접근입니다😭",
      });
      return;
    }

    await createOnesignalPush({
      title: "PrayU",
      subtitle: "기도제목 요청 알림",
      message: `누군가가 ${targetGroup.name}에서 기도제목을 기다리고 있어요!`,
      data: {
        url: `${import.meta.env.VITE_BASE_URL}/group/${targetGroup.id}`,
      },
      userIds: [otherMember.user_id],
    });
    await createNotification({
      userId: [otherMember.user_id],
      senderId: user.id,
      groupId: targetGroup.id,
      title: "기도제목 요청 알림",
      body: `누군가가 ${targetGroup.name}에서 기도제목을 기다리고 있어요!`,
      type: NotificationType.SNS,
      data: {},
    });
    analyticsTrack("클릭_알림_작성요청", { where: "OtherMemberDrawer" });

    toast({
      description: "기도제목 요청 알림을 보냈어요!",
    });
  };

  const ExpiredSection = (
    <div className="w-full flex flex-col items-center justify-center gap-2 py-4">
      <div className="flex flex-col items-center gap-2 mb-2">
        {dateDistance.days >= 7 ? (
          <p className="text-xl font-bold">
            작성 된 지 {dateDistance.days}일이 되었어요 😂
          </p>
        ) : (
          <p className="text-xl font-bold">기도제목이 만료되었어요 😂</p>
        )}
        <p className="text-gray-500">
          {otherPrayCardList?.[0]?.profiles.full_name}님에게 기도제목을 요청해
          보아요
        </p>
      </div>

      <div className="w-full max-w-md flex flex-col gap-2 px-4">
        <button
          className="w-full rounded-lg bg-[#FEE500] text-center py-3 text-black font-medium flex items-center justify-center gap-2 border border-gray-200"
          onClick={() => onClickSendKakaoMessage()}
        >
          <img src={kakaoIcon} className="w-5 h-5" />
          카카오톡 메세지 보내기
        </button>
        <button
          className="w-full rounded-lg bg-white border border-gray-300 py-3 text-gray-700 font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
          onClick={() => onClickSendNotificationRequest()}
        >
          <RiNotification4Line className="w-5 h-5" />
          작성 요청 알림 보내기
        </button>
      </div>
    </div>
  );

  const NoPrayCardSection = (
    <div className="w-full flex flex-col items-center justify-center gap-2 py-4">
      <div className="flex flex-col items-center gap-2 mb-2">
        <p className="text-xl font-bold">기도카드가 만들어지지 않았어요 😂</p>
        <p className="text-gray-500">기도제목을 요청해 보아요!</p>
      </div>
      <div className="w-full max-w-md flex flex-col gap-2 px-4">
        <button
          className="w-full rounded-lg bg-[#FEE500] text-center py-3 text-black font-medium flex items-center justify-center gap-2 border border-gray-200"
          onClick={() => onClickSendKakaoMessage()}
        >
          <img src={kakaoIcon} className="w-5 h-5" />
          카카오톡 메세지 보내기
        </button>
        <button
          className="w-full rounded-lg bg-white border border-gray-300 py-3 text-gray-700 font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
          onClick={() => onClickSendNotificationRequest()}
        >
          <RiNotification4Line className="w-5 h-5" />
          작성 요청 알림 보내기
        </button>
      </div>
    </div>
  );

  return (
    <Drawer
      open={isOpenOtherMemberDrawer}
      onOpenChange={(open) => {
        setIsOpenOtherMemberDrawer(open);
        if (!open && window.history.state?.open === true) window.history.back();
      }}
    >
      <DrawerContent className="bg-mainBg flex flex-col max-h-90vh">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <div className="px-8 py-5 flex flex-col flex-grow gap-4 overflow-y-auto">
          <PrayCard prayCard={otherPrayCardList?.[0]} />
          {!otherPrayCardList || otherPrayCardList.length === 0 ? (
            NoPrayCardSection
          ) : !isCurrentWeek(otherPrayCardList[0].created_at) ? (
            ExpiredSection
          ) : (
            <ReactionWithCalendar
              prayCard={otherPrayCardList[0]}
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
