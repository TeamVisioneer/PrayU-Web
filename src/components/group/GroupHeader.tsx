import OpenShareDrawerBtn from "@/components/share/OpenShareDrawerBtn";
import GroupMenuBtn from "./GroupMenuBtn";
import NotificationBtn from "../notification/NotificationBtn";
import useBaseStore from "@/stores/baseStore";
import { analyticsTrack } from "@/analytics/analytics";

const GroupHeader: React.FC = () => {
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const setIsOpenGroupListDrawer = useBaseStore(
    (state) => state.setIsOpenGroupListDrawer
  );
  const user = useBaseStore((state) => state.user);
  const fetchGroupListByUserId = useBaseStore(
    (state) => state.fetchGroupListByUserId
  );
  const myMember = useBaseStore((state) => state.myMember);
  const memberList = useBaseStore((state) => state.memberList);

  const handleClickGroupName = async () => {
    if (user) await fetchGroupListByUserId(user.id);
    setIsOpenGroupListDrawer(true);
    analyticsTrack("클릭_그룹_이름", {
      where: "GroupHeader",
    });
  };

  const filteredMemberList = myMember?.profiles.blocking_users
    ? memberList?.filter(
        (member) =>
          member.user_id &&
          !myMember.profiles.blocking_users.includes(member.user_id)
      )
    : memberList;

  return (
    <div className="sticky top-0 flex justify-between items-center p-5 bg-mainBg z-10">
      <OpenShareDrawerBtn
        text="초대"
        eventOption={{ where: "GroupPage" }}
        type="tag"
      />
      <div
        className="text-lg font-bold flex items-center gap-1 cursor-pointer"
        onClick={() => handleClickGroupName()}
      >
        <div className="max-w-52 whitespace-nowrap overflow-hidden text-ellipsis">
          {targetGroup?.name}
        </div>
        <span className="text-sm text-gray-500">
          {filteredMemberList?.length || 0}
        </span>
      </div>
      <div className="w-[48px] flex justify-between items-center ">
        <NotificationBtn />
        <GroupMenuBtn />
      </div>
    </div>
  );
};

export default GroupHeader;
