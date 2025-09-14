import React from "react";
import { Group, MemberWithProfiles } from "supabase/types/tables";
import { Badge } from "../ui/badge";
import { UserProfile } from "../profile/UserProfile";
import GroupMemberOptionTag from "./GroupMemberOptionTag";
import OpenShareDrawerBtn from "../share/OpenShareDrawerBtn";
import useBaseStore from "@/stores/baseStore";
import GroupMemberShowMoreBtn from "./GroupMemberShowMoreBtn";

interface GroupMemberProfileListProps {
  memberListView: MemberWithProfiles[];
  targetGroup: Group;
}

const GroupMemberProfileList: React.FC<GroupMemberProfileListProps> = ({
  memberListView,
  targetGroup,
}) => {
  const memberCount = useBaseStore((state) => state.memberCount);
  const memberList = useBaseStore((state) => state.memberList);
  const myMember = useBaseStore((state) => state.myMember);
  const fetchMemberListByGroupId = useBaseStore(
    (state) => state.fetchMemberListByGroupId
  );
  const setMemberList = useBaseStore((state) => state.setMemberList);
  const setMemberListView = useBaseStore((state) => state.setMemberListView);
  const memberListOffset = useBaseStore((state) => state.memberListOffset);
  const memberListPageSize = useBaseStore((state) => state.memberListPageSize);
  const setMemberListOffset = useBaseStore(
    (state) => state.setMemberListOffset
  );

  const onClickMoreMemberList = async () => {
    if (!targetGroup || !memberCount) return;
    if (memberListOffset >= memberCount) return;

    setMemberList(null);
    const limit =
      memberListOffset > memberCount
        ? memberCount - memberListOffset
        : memberListPageSize;
    const newMemberList = await fetchMemberListByGroupId(
      targetGroup.id,
      limit,
      memberListOffset
    );
    if (!newMemberList) return;
    const filteredMemberList = myMember?.profiles.blocking_users
      ? newMemberList?.filter(
          (member) =>
            member.user_id &&
            !myMember.profiles.blocking_users.includes(member.user_id)
        )
      : newMemberList;

    const groupLeaderIndex = filteredMemberList.findIndex(
      (member) => member.user_id === targetGroup.user_id
    );

    if (groupLeaderIndex !== -1) {
      const [groupLeaderMember] = filteredMemberList.splice(
        groupLeaderIndex,
        1
      );
      filteredMemberList.unshift(groupLeaderMember);
    }

    setMemberListView([...memberListView, ...filteredMemberList]);
    setMemberListOffset(memberListOffset + memberListPageSize);
  };

  const filteredMemberList = myMember?.profiles.blocking_users
    ? memberListView?.filter(
        (member) =>
          member.user_id &&
          !myMember.profiles.blocking_users.includes(member.user_id)
      )
    : memberListView;

  const groupLeaderIndex = filteredMemberList.findIndex(
    (member) => member.user_id === targetGroup.user_id
  );

  if (groupLeaderIndex !== -1) {
    const [groupLeaderMember] = filteredMemberList.splice(groupLeaderIndex, 1);
    filteredMemberList.unshift(groupLeaderMember);
  }

  return (
    <div className="w-full gap-3 flex flex-col max-h-52 overflow-auto scrollbar-rounded pr-2 mb-3">
      <OpenShareDrawerBtn
        text="그룹원 초대"
        eventOption={{ where: "group" }}
        type="profile"
      />
      {filteredMemberList.map((member) => (
        <div key={member.id} className="flex justify-between">
          <UserProfile
            profile={member.profiles}
            imgSize="w-7 h-7"
            fontSize="font-midium"
          />
          {member.user_id === targetGroup.user_id ? (
            <Badge>그룹장</Badge>
          ) : (
            <GroupMemberOptionTag member={member} />
          )}
        </div>
      ))}
      {memberCount && memberListOffset < memberCount && (
        <div className="flex justify-center">
          <GroupMemberShowMoreBtn
            onClick={onClickMoreMemberList}
            isLoading={!memberList}
          />
        </div>
      )}
    </div>
  );
};

export default GroupMemberProfileList;
