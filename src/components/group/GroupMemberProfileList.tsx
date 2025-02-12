import React from "react";
import { Group, MemberWithProfiles } from "supabase/types/tables";
import { Badge } from "../ui/badge";
import { UserProfile } from "../profile/UserProfile";
import GroupMemberOptionTag from "./GroupMemberOptionTag";
import OpenShareDrawerBtn from "../share/OpenShareDrawerBtn";

interface GroupMemberProfileListProps {
  memberList: MemberWithProfiles[];
  targetGroup: Group;
}

const GroupMemberProfileList: React.FC<GroupMemberProfileListProps> = ({
  memberList,
  targetGroup,
}) => {
  const sortedMembers = [...memberList].sort((a, b) =>
    a.user_id === targetGroup.user_id
      ? -1
      : b.user_id === targetGroup.user_id
      ? 1
      : 0
  );

  return (
    <div className="w-full flex flex-col gap-3 max-h-48 overflow-auto scrollbar-rounded pr-2">
      <OpenShareDrawerBtn
        text="그룹원 초대"
        eventOption={{ where: "group" }}
        type="profile"
      />
      {sortedMembers.map((member) => (
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
    </div>
  );
};

export default GroupMemberProfileList;
