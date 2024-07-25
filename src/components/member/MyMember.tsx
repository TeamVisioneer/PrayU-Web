import { getISODate, getISOTodayDate, reduceString } from "../../lib/utils";
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

  const startDt = getISOTodayDate();
  const endDt = getISOTodayDate(7);

  useEffect(() => {
    getMemberByUserId(currentUserId);
    fetchUserPrayCardListByGroupId(currentUserId, groupId, startDt, endDt);
  }, [
    currentUserId,
    groupId,
    getMemberByUserId,
    fetchUserPrayCardListByGroupId,
    startDt,
    endDt,
  ]);

  if (!member || !userPrayCardList) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  if (userPrayCardList.length === 0) {
    return (
      <PrayCardCreateModal currentUserId={currentUserId} groupId={groupId} />
    );
  }

  const prayCard = userPrayCardList[0] || null;
  const content = prayCard
    ? reduceString(prayCard.content, 20)
    : "아직 기도제목이 없어요";

  const MyMemberUI = (
    <div className="flex flex-col gap-2 cursor-pointer bg-blue-100 p-4 rounded ">
      <div className="flex items-center gap-2">
        <img
          src={member?.profiles.avatar_url || ""}
          alt={`${member?.profiles.full_name}'s avatar`}
          className="w-5 h-5 rounded-full"
        />
        <h3>{member?.profiles.full_name}</h3>
      </div>
      <div className="text-left text-sm text-gray-600">{content}</div>
      <div className="text-gray-400 text-left text-xs">
        {prayCard && getISODate(prayCard.updated_at).split("T")[0]}
      </div>
    </div>
  );

  return (
    <Drawer>
      <DrawerTrigger className="focus:outline-none">
        <div className="text-sm ">내 기도제목</div>
        {MyMemberUI}
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
