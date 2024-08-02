import { useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import { ClipLoader } from "react-spinners";
import { userIdPrayCardListHash } from "../../../supabase/types/tables";
import OtherMember from "./OtherMember";
import { getISOTodayDate } from "@/lib/utils";
import MemberInviteCard from "./MemberInviteCard";
import TodayPrayBtn from "../todayPray/TodayPrayBtn";

interface OtherMembersProps {
  currentUserId: string;
  groupId: string | undefined;
}

const OtherMemberList: React.FC<OtherMembersProps> = ({
  currentUserId,
  groupId,
}) => {
  const memberList = useBaseStore((state) => state.memberList);
  const fetchMemberListByGroupId = useBaseStore(
    (state) => state.fetchMemberListByGroupId
  );
  const groupPrayCardList = useBaseStore((state) => state.groupPrayCardList);
  const fetchGroupPrayCardList = useBaseStore(
    (state) => state.fetchGroupPrayCardList
  );

  const startDt = getISOTodayDate(-6);
  const endDt = getISOTodayDate(1);

  // PrayCardList 멤버리스트에서는 PrayCardList 불러오지 않기
  useEffect(() => {
    fetchGroupPrayCardList(groupId, currentUserId, startDt, endDt);
    fetchMemberListByGroupId(groupId);
  }, [
    fetchGroupPrayCardList,
    fetchMemberListByGroupId,
    groupId,
    currentUserId,
    startDt,
    endDt,
  ]);

  if (!memberList || !groupPrayCardList) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  const otherMembers = memberList.filter(
    (member) => member.user_id !== currentUserId
  );

  // TODO: 이것도 제거하기
  const userIdPrayCardListHash = memberList.reduce((hash, member) => {
    const prayCardList = groupPrayCardList.filter(
      (prayCard) => prayCard.user_id === member.user_id
    );
    hash[member.user_id || "deletedUser"] = prayCardList;
    return hash;
  }, {} as userIdPrayCardListHash);

  if (otherMembers.length === 0) return <MemberInviteCard />;
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-gray-500 p-2">기도 구성원</div>
      <div className="flex flex-col gap-4">
        {otherMembers.map((member) => (
          <OtherMember
            key={member.id}
            currentUserId={currentUserId}
            member={member}
            prayCardList={userIdPrayCardListHash[member.user_id || ""]}
          ></OtherMember>
        ))}
      </div>
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2">
        <TodayPrayBtn eventOption={{ where: "OtherMemberList" }} />
      </div>
    </div>
  );
};

export default OtherMemberList;
