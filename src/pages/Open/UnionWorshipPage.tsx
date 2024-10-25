import GroupHeader from "@/components/group/GroupHeader";
import ReactionResultBox from "@/components/pray/ReactionResultBox";
import TodayPrayStartCard from "@/components/todayPray/TodayPrayStartCard";
import { Skeleton } from "@/components/ui/skeleton";
import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";

const UnionWorshipPage = () => {
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const getGroup = useBaseStore((state) => state.getGroup);
  const fetchMemberListByGroupId = useBaseStore(
    (state) => state.fetchMemberListByGroupId
  );
  const memberList = useBaseStore((state) => state.memberList);

  useEffect(() => {
    getGroup("9085a291-7eb2-4b00-9f85-0ccd98f433a7");
    fetchMemberListByGroupId("9085a291-7eb2-4b00-9f85-0ccd98f433a7");
  }, [fetchMemberListByGroupId, getGroup]);

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
        groupList={[]}
        targetGroup={targetGroup}
        otherMemberList={memberList}
      />
      <div className="flex flex-col flex-grow gap-4">
        {MyMemberUI}
        <TodayPrayStartCard />
      </div>
    </div>
  );
};

export default UnionWorshipPage;
