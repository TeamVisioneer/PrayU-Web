import OpenShareDrawerBtn from "@/components/share/OpenShareDrawerBtn";
import GroupMenuBtn from "./GroupMenuBtn";
import { GroupWithProfiles, Group } from "supabase/types/tables";
import NotificationBtn from "../notification/NotificationBtn";
import useBaseStore from "@/stores/baseStore";

interface GroupHeaderProps {
  targetGroup: GroupWithProfiles;
  groupList: Group[];
}

const GroupHeader: React.FC<GroupHeaderProps> = ({
  targetGroup,
  groupList,
}) => {
  const memberCount = useBaseStore((state) => state.memberCount);

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
