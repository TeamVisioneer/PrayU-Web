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
  const memberLoading = useBaseStore((state) => state.memberLoading);
  const getMember = useBaseStore((state) => state.getMember);
  const fetchUserPrayCardListByGroupId = useBaseStore(
    (state) => state.fetchUserPrayCardListByGroupId
  );
  const userPrayCardList = useBaseStore((state) => state.userPrayCardList);
  const setPrayCardContent = useBaseStore((state) => state.setPrayCardContent);
  const inputPrayCardContent = useBaseStore(
    (state) => state.inputPrayCardContent
  );

  useEffect(() => {
    getMember(currentUserId, groupId);
    fetchUserPrayCardListByGroupId(currentUserId, groupId);
  }, [currentUserId, fetchUserPrayCardListByGroupId, getMember, groupId]);

  useEffect(() => {
    setPrayCardContent(member?.pray_summary || "");
  }, [member, setPrayCardContent]);

  if (memberLoading || !userPrayCardList) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  if (
    member == null ||
    userPrayCardList.length === 0 ||
    userPrayCardList[0].created_at < getISOTodayDate(-6)
  ) {
    return (
      <PrayCardCreateModal
        currentUserId={currentUserId}
        groupId={groupId}
        member={member}
      />
    );
  }

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
    <div className="w-full flex flex-col gap-2 cursor-pointer bg-white p-4 rounded-2xl shadow-md">
      <div className="flex items-center gap-2">
        <img
          src={member.profiles.avatar_url || ""}
          className="w-5 h-5 rounded-full"
        />
        <h3 className="font-bold">
          {/*member.profiles.full_name*/ "내 기도제목"}
        </h3>
      </div>
      <div className="text-left text-sm text-gray-600">
        {reduceString(inputPrayCardContent, 20)}
      </div>
      <div className="text-gray-400 text-left text-xs">{dateDistanceText}</div>
    </div>
  );

  const prayCard = userPrayCardList[0];

  return (
    <Drawer>
      <DrawerTrigger className="focus:outline-none">
        <div className="flex flex-col items-start gap-2">{MyMemberUI}</div>
      </DrawerTrigger>

      <DrawerContent className="max-w-[480px] mx-auto w-full h-[90%] px-10 pb-20 focus:outline-none">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        {/* PrayCard */}
        <PrayCardUI
          currentUserId={currentUserId}
          member={member}
          prayCard={prayCard}
        />
        {/* PrayCard */}
      </DrawerContent>
    </Drawer>
  );
};

export default MyMember;
