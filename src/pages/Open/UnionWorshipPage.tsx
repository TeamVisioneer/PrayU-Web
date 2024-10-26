import LogInDrawer from "@/components/auth/LogInDrawer";
import GroupHeader from "@/components/group/GroupHeader";
import MyMember from "@/components/member/MyMember";
import ReactionResultBox from "@/components/pray/ReactionResultBox";
import ShareDrawer from "@/components/share/ShareDrawer";
import TodayPrayCardListDrawer from "@/components/todayPray/TodayPrayCardListDrawer";
import TodayPrayStartCard from "@/components/todayPray/TodayPrayStartCard";
import { Skeleton } from "@/components/ui/skeleton";
import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";

const UnionWorshipPage = () => {
  const { user } = useBaseStore();
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const getGroup = useBaseStore((state) => state.getGroup);
  const getMember = useBaseStore((state) => state.getMember);
  const myMember = useBaseStore((state) => state.myMember);
  const fetchMemberListByGroupId = useBaseStore(
    (state) => state.fetchMemberListByGroupId
  );
  const memberList = useBaseStore((state) => state.memberList);
  const groupList = useBaseStore((state) => state.groupList);
  const fetchGroupListByUserId = useBaseStore(
    (state) => state.fetchGroupListByUserId
  );
  const groupId = String(import.meta.env.VITE_UNION_WORSHIP_GROUP_ID);

  useEffect(() => {
    getGroup(groupId);
    if (user) {
      getMember(user.id, groupId);
      fetchGroupListByUserId(user.id);
    }
    fetchMemberListByGroupId(groupId);
  }, [
    fetchMemberListByGroupId,
    getGroup,
    getMember,
    user,
    fetchGroupListByUserId,
    groupId,
  ]);

  if (!targetGroup || !memberList) {
    return (
      <div className="flex flex-col h-full gap-4 pt-[48px]">
        <Skeleton className="w-full h-[150px] flex items-center gap-4 p-4 bg-gray-200 rounded-xl" />
        <Skeleton className="w-full flex-grow flex items-center gap-4 p-4 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  const MyMemberUI = (
    <div className="w-full flex flex-col gap-3 cursor-pointer bg-white p-6 rounded-[15px]">
      <div className="flex flex-col gap-1">
        <h3 className="flex font-bold text-lg">내 기도제목</h3>
        <div className="text-left text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
          ✏️ 기도카드를 작성해 보아요
        </div>
      </div>
      <div className="flex gap-2">
        <ReactionResultBox prayData={[]} eventOption={{ where: "MyMember" }} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full gap-5">
      <GroupHeader
        groupList={groupList || []}
        targetGroup={targetGroup}
        otherMemberList={memberList}
      />
      <div className="flex flex-col flex-grow gap-4">
        {myMember ? <MyMember myMember={myMember} /> : MyMemberUI}
        <TodayPrayStartCard />
      </div>
      <ShareDrawer />
      <TodayPrayCardListDrawer />
      <LogInDrawer />
    </div>
  );
};

export default UnionWorshipPage;
