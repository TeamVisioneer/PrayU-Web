import { Group } from "supabase/types/tables";
import useBaseStore from "@/stores/baseStore";
import TodayPrayCardList from "@/components/todayPray/TodayPrayCardList";
import MyMember from "@/components/member/MyMember";
import GroupLimitCard from "@/components/group/GroupLimitCard";
import OtherMemberList from "@/components/member/OtherMemberList";
import { useEffect } from "react";
import { ClipLoader } from "react-spinners";

interface GroupBodyProps {
  currentUserId: string;
  groupList: Group[];
  targetGroup: Group;
}

const GroupBody: React.FC<GroupBodyProps> = ({
  currentUserId,
  groupList,
  targetGroup,
}) => {
  const isParamsGroupIdinGroupList = groupList.some(
    (group) => group.id === targetGroup.id
  );
  const maxGroupCount = Number(import.meta.env.VITE_MAX_GROUP_COUNT);

  const myMember = useBaseStore((state) => state.myMember);
  const getMember = useBaseStore((state) => state.getMember);
  const userPlan = useBaseStore((state) => state.userPlan);

  useEffect(() => {
    if (targetGroup) getMember(currentUserId, targetGroup.id);
  }, [currentUserId, targetGroup, getMember]);

  if (!myMember) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={20} color={"#70AAFF"} loading={true} />
      </div>
    );
  }

  if (
    groupList.length >= maxGroupCount &&
    !isParamsGroupIdinGroupList &&
    userPlan != "Premium"
  ) {
    return <GroupLimitCard />;
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <MyMember myMember={myMember} />
      <OtherMemberList currentUserId={currentUserId} groupId={targetGroup.id} />
      <TodayPrayCardList
        currentUserId={currentUserId}
        groupId={targetGroup.id}
      />
    </div>
  );
};

export default GroupBody;
