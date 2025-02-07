import { Group } from "supabase/types/tables";
import GroupMenuBtn from "./GroupMenuBtn";
import NotificationBtn from "../notification/NotificationBtn";

interface GroupListHeaderProps {
  userGroupList: Group[];
}

const GroupListHeader: React.FC<GroupListHeaderProps> = ({ userGroupList }) => {
  return (
    <header className="sticky top-0 flex items-center justify-between p-4 z-10 border-b border-gray-200 bg-mainBg">
      <h1 className="text-xl font-bold text-[#222222]">참여 그룹</h1>
      <div className="flex items-center gap-2">
        <NotificationBtn />
        <GroupMenuBtn userGroupList={userGroupList} />
      </div>
    </header>
  );
};

export default GroupListHeader;
