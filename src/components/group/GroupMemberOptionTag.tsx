import { MemberWithProfiles } from "supabase/types/tables";
import { Badge } from "../ui/badge";
import useBaseStore from "@/stores/baseStore";
import { analyticsTrack } from "@/analytics/analytics";

interface GroupMemberOptionTagProps {
  member: MemberWithProfiles;
}

const GroupMemberOptionTag: React.FC<GroupMemberOptionTagProps> = ({
  member,
}) => {
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const setAlertData = useBaseStore((state) => state.setAlertData);
  const setIsConfirmAlertOpen = useBaseStore(
    (state) => state.setIsConfirmAlertOpen
  );
  const updateGroup = useBaseStore((state) => state.updateGroup);
  const deleteMemberbyGroupId = useBaseStore(
    (state) => state.deleteMemberbyGroupId
  );
  const deletePrayCardByGroupId = useBaseStore(
    (state) => state.deletePrayCardByGroupId
  );
  const activeGroupMemberOption = useBaseStore(
    (state) => state.activeGroupMemberOption
  );

  const onClickDeleteMemberInGroup = () => {
    if (!targetGroup) return;
    setAlertData({
      color: "bg-red-400",
      title: "그룹 내보내기",
      description: `해당 그룹에서  ${member.profiles.full_name} 님을 내보내시겠어요?\n*${member.profiles.full_name} 님의 기도카드는 모두 삭제되어요`,
      actionText: "내보내기",
      cancelText: "취소",
      onAction: async () => {
        await deleteMemberbyGroupId(member.profiles.id, targetGroup.id);
        await deletePrayCardByGroupId(member.profiles.id, targetGroup.id);
        window.location.replace(`/group/${targetGroup.id}`);
        analyticsTrack("클릭_그룹_내보내기", { group_id: targetGroup.id });
      },
    });
    setIsConfirmAlertOpen(true);
  };

  const onClickAssignGroupLeader = () => {
    if (!targetGroup) return;
    setAlertData({
      color: "bg-blue-400",
      title: "그룹장 양도",
      description: `${member.profiles.full_name} 님에게 그룹장을 양도하시겠습니까?`,
      actionText: "그룹장 양도",
      cancelText: "취소",
      onAction: async () => {
        await updateGroup(targetGroup.id, { user_id: member.profiles.id });
        analyticsTrack("클릭_그룹_그룹장양도", { group_id: targetGroup.id });
        // window.location.replace(`/group/${targetGroup.id}`);
      },
    });
    setIsConfirmAlertOpen(true);
  };

  if (activeGroupMemberOption == "assign") {
    return (
      <Badge variant="secondary" onClick={() => onClickAssignGroupLeader()}>
        그룹장 양도
      </Badge>
    );
  } else if (activeGroupMemberOption == "delete") {
    return (
      <Badge variant="secondary" onClick={() => onClickDeleteMemberInGroup()}>
        내보내기
      </Badge>
    );
  } else {
    return null;
  }
};

export default GroupMemberOptionTag;
