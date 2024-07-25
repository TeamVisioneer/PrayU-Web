import { useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import { ClipLoader } from "react-spinners";
import { userIdPrayCardListHash } from "../../../supabase/types/tables";
import Member from "./Member";
import PrayCardCreateModal from "../prayCard/PrayCardCreateModal";
import { getISOTodayDate } from "@/lib/utils";

interface MembersProps {
  currentUserId: string;
  groupId: string | undefined;
}

const OtherMemberList: React.FC<MembersProps> = ({
  currentUserId,
  groupId,
}) => {
  const memberList = useBaseStore((state) => state.memberList);
  const groupPrayCardList = useBaseStore((state) => state.groupPrayCardList);
  const fetchGroupPrayCardList = useBaseStore(
    (state) => state.fetchGroupPrayCardList
  );
  const fetchMemberListByGroupId = useBaseStore(
    (state) => state.fetchMemberListByGroupId
  );

  const startDt = getISOTodayDate();
  const endDt = getISOTodayDate(7);

  useEffect(() => {
    fetchMemberListByGroupId(groupId);
    fetchGroupPrayCardList(groupId, startDt, endDt);
  }, [
    fetchMemberListByGroupId,
    fetchGroupPrayCardList,
    groupId,
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

  const userIdPrayCardListHash = memberList.reduce((hash, member) => {
    const prayCardList = groupPrayCardList.filter(
      (prayCard) => prayCard.user_id === member.user_id
    );
    hash[member.user_id || "deletedUser"] = prayCardList;
    return hash;
  }, {} as userIdPrayCardListHash);

  if (!userIdPrayCardListHash[currentUserId || ""]) {
    return (
      <PrayCardCreateModal currentUserId={currentUserId} groupId={groupId} />
    );
    // 명준이 형 머지 후 다시 아래 코드를 groupPage.tsx로 옮겨야 함
    // if (currentGroupCount < maxPossibleGroupCount) {
    //   return (
    //     // TODO: 모달로 변경 필요
    //     <PrayCardCreateModal currentUserId={currentUserId} groupId={groupId} />
    //   );
    // } else {
    //   return (
    //     <div>최대 {maxPossibleGroupCount}개의 그룹만 참여할 수 있어요</div>
    //   );
    // }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="text-base text-gray-950">
          Members({otherMembers.length + 1})
        </div>
        <div className="flex flex-col gap-2">
          {otherMembers.map((member) => (
            <Member
              key={member.id}
              currentUserId={currentUserId}
              member={member}
              prayCardList={userIdPrayCardListHash[member.user_id || ""]}
            ></Member>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OtherMemberList;
