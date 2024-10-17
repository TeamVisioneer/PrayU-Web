import OpenShareDrawerBtn from "@/components/share/OpenShareDrawerBtn";
import GroupMenuBtn from "./GroupMenuBtn";
import {
  GroupWithProfiles,
  MemberWithProfiles,
  Group,
} from "supabase/types/tables";

interface GroupHeaderProps {
  otherMemberList: MemberWithProfiles[];
  targetGroup: GroupWithProfiles;
  groupList: Group[];
}

const GroupHeader: React.FC<GroupHeaderProps> = ({
  otherMemberList,
  targetGroup,
  groupList,
}) => {
  return (
    <div className="flex justify-between items-center">
      <OpenShareDrawerBtn
        text="초대"
        eventOption={{ where: "GroupPage" }}
        type="tag"
      />
      <div className="text-lg font-bold flex items-center gap-1">
        <div className="max-w-52 whitespace-nowrap overflow-hidden text-ellipsis">
          {targetGroup.name}
        </div>
        <span className="text-sm text-gray-500">
          {otherMemberList.length + 1}
        </span>
      </div>
      <div className="w-[48px] flex justify-end">
        <GroupMenuBtn userGroupList={groupList} targetGroup={targetGroup} />
      </div>
    </div>
  );
};

export default GroupHeader;
