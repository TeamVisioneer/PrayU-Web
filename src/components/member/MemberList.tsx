import { useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import { ClipLoader } from "react-spinners";
import { userIdPrayCardListHash } from "../../../supabase/types/tables";
import Member from "./Member";
import PrayCardCreateModal from "../prayCard/PrayCardCreateModal";

interface MembersProps {
  currentUserId: string | undefined;
  groupId: string | undefined;
}

const MemberList: React.FC<MembersProps> = ({ currentUserId, groupId }) => {
  const memberList = useBaseStore((state) => state.memberList);
  const groupPrayCardList = useBaseStore((state) => state.groupPrayCardList);
  const fetchPrayCardListByGroupId = useBaseStore(
    (state) => state.fetchPrayCardListByGroupId
  );
  const fetchMemberListByGroupId = useBaseStore(
    (state) => state.fetchMemberListByGroupId
  );

  useEffect(() => {
    fetchMemberListByGroupId(groupId);
    fetchPrayCardListByGroupId(groupId);
  }, [
    currentUserId,
    groupId,
    fetchMemberListByGroupId,
    fetchPrayCardListByGroupId,
  ]);

  if (!memberList || !groupPrayCardList) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  const currentMember = memberList.find(
    (member) => member.user_id === currentUserId
  );
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
    // TODO: 모달로 변경 필요
    return (
      <PrayCardCreateModal currentUserId={currentUserId} groupId={groupId} />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="text-sm ">내 기도제목</div>
        <Member
          currentUserId={currentUserId}
          member={currentMember}
          prayCardList={userIdPrayCardListHash[currentUserId || ""]}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-sm">Members({otherMembers.length + 1})</div>
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

export default MemberList;
