import OpenShareDrawerBtn from "@/components/share/OpenShareDrawerBtn";
import GroupMenuBtn from "./GroupMenuBtn";
import NotificationBtn from "../notification/NotificationBtn";
import useBaseStore from "@/stores/baseStore";
import { analyticsTrack } from "@/analytics/analytics";
import { Skeleton } from "../ui/skeleton";

const GroupHeader: React.FC = () => {
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const setIsOpenGroupListDrawer = useBaseStore(
    (state) => state.setIsOpenGroupListDrawer
  );
  const user = useBaseStore((state) => state.user);
  const fetchGroupListByUserId = useBaseStore(
    (state) => state.fetchGroupListByUserId
  );
  const memberCount = useBaseStore((state) => state.memberCount);

  const handleClickGroupName = async () => {
    setIsOpenGroupListDrawer(true);
    if (user) await fetchGroupListByUserId(user.id);
    analyticsTrack("클릭_그룹_이름", {
      where: "GroupHeader",
    });
  };

  return (
    <div className="sticky top-0 flex justify-between items-center p-5 bg-mainBg z-50">
      <OpenShareDrawerBtn
        text="초대"
        eventOption={{ where: "GroupPage" }}
        type="tag"
      />
      {targetGroup ? (
        <div
          className="text-lg font-bold flex items-center gap-1 cursor-pointer h-6"
          onClick={() => handleClickGroupName()}
        >
          <div className="max-w-52 whitespace-nowrap overflow-hidden text-ellipsis">
            {targetGroup.name}
          </div>
          <span className="text-sm text-gray-500">{memberCount || 0}</span>
        </div>
      ) : (
        <Skeleton className="w-24 h-6 bg-gray-200" />
      )}
      <div className="w-[48px] flex justify-between items-center ">
        <NotificationBtn />
        <GroupMenuBtn />
      </div>
    </div>
  );
};

export default GroupHeader;
