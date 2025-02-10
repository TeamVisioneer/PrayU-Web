import OpenShareDrawerBtn from "@/components/share/OpenShareDrawerBtn";
import GroupMenuBtn from "./GroupMenuBtn";
import { GroupWithProfiles, Group } from "supabase/types/tables";
import NotificationBtn from "../notification/NotificationBtn";

interface GroupHeaderProps {
  targetGroup: GroupWithProfiles;
  groupList: Group[];
  memberCount: number;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({
  targetGroup,
  groupList,
  memberCount,
}) => {
  return (
    <div className="sticky top-0 flex justify-between items-center p-5 bg-mainBg z-10">
      <OpenShareDrawerBtn
        text="초대"
        eventOption={{ where: "GroupPage" }}
        type="tag"
      />
      <div className="text-lg font-bold flex items-center gap-1">
        <div className="max-w-52 whitespace-nowrap overflow-hidden text-ellipsis">
          {targetGroup.name}
        </div>
        <span className="text-sm text-gray-500">{memberCount}</span>
      </div>
      <div className="w-[48px] flex justify-between items-center ">
        <NotificationBtn />
        <GroupMenuBtn userGroupList={groupList} targetGroup={targetGroup} />
      </div>
    </div>
  );
};

export default GroupHeader;
