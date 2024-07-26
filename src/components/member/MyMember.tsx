import { getISOTodayDate, reduceString } from "../../lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import PrayCardUI from "../prayCard/PrayCardUI";
import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";
import { ClipLoader } from "react-spinners";
import PrayCardCreateModal from "../prayCard/PrayCardCreateModal";
import { getDateDistance, getDateDistanceText } from "@toss/date";
import { getISOOnlyDate } from "@/lib/utils";

interface MemberProps {
  currentUserId: string;
  groupId: string | undefined;
}

const MyMember: React.FC<MemberProps> = ({ currentUserId, groupId }) => {
  const member = useBaseStore((state) => state.targetMember);
  const getMemberByUserId = useBaseStore((state) => state.getMemberByUserId);
  const fetchUserPrayCardListByGroupId = useBaseStore(
    (state) => state.fetchUserPrayCardListByGroupId
  );
  const userPrayCardList = useBaseStore((state) => state.userPrayCardList);

  useEffect(() => {
    getMemberByUserId(currentUserId);
    fetchUserPrayCardListByGroupId(currentUserId, groupId);
  }, [
    currentUserId,
    groupId,
    getMemberByUserId,
    fetchUserPrayCardListByGroupId,
  ]);

  if (!member || !userPrayCardList) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  if (
    userPrayCardList.length === 0 ||
    userPrayCardList[0].created_at < getISOTodayDate(-6)
  ) {
    return (
      <PrayCardCreateModal currentUserId={currentUserId} groupId={groupId} />
    );
  }

  const prayCard = userPrayCardList[0] || null;
  const content = prayCard
    ? reduceString(prayCard.content, 20)
    : "아직 기도제목이 없어요";

  const dateDistance = getDateDistance(
    new Date(getISOOnlyDate(member?.updated_at ?? null)),
    new Date(getISOTodayDate())
  );

  let dateDistanceText = getDateDistanceText(dateDistance, {
    days: (t) => 1 <= t.days,
    hours: () => false,
    minutes: () => false,
    seconds: () => false,
  });

  if (dateDistance.days < 1) {
    dateDistanceText = "오늘";
  }

  const MyMemberUI = (
    <div className="w-full flex flex-col gap-2 cursor-pointer bg-blue-100 p-4 rounded ">
      <div className="flex items-center gap-2">
        <img
          src={member?.profiles.avatar_url || ""}
          alt={`${member?.profiles.full_name}'s avatar`}
          className="w-5 h-5 rounded-full"
        />
        <h3>{member?.profiles.full_name}</h3>
      </div>
      <div className="text-left text-sm text-gray-600">{content}</div>
      <div className="text-gray-400 text-left text-xs">{dateDistanceText}</div>
    </div>
  );

  return (
    <Drawer>
      <DrawerTrigger className="focus:outline-none">
        <div className="flex flex-col items-start gap-2">
          <div className="text-base text-gray-950">My</div>
          {MyMemberUI}
        </div>
      </DrawerTrigger>

      <DrawerContent className="max-w-[480px] mx-auto w-full h-[90%] px-10 pb-20 focus:outline-none">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        {/* PrayCard */}
        <PrayCardUI currentUserId={currentUserId} prayCard={prayCard} />
        {/* PrayCard */}
      </DrawerContent>
    </Drawer>
  );
};

export default MyMember;
