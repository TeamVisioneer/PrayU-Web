import { useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import { ClipLoader } from "react-spinners";
import { userIdPrayCardListHash } from "../../../supabase/types/tables";
import Member from "./Member";

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

  const userIdPrayCardListHash = memberList.reduce((hash, member) => {
    const prayCardList = groupPrayCardList.filter(
      (prayCard) => prayCard.user_id === member.user_id
    );
    hash[member.user_id || "deletedUser"] = prayCardList;
    return hash;
  }, {} as userIdPrayCardListHash);

  if (!userIdPrayCardListHash[currentUserId || ""]) {
    return <div>기도카드 작성 모달</div>;
  }

  return (
    <div>
      맴버 리스트
      {memberList.map((member) => (
        <Member
          key={member.id}
          member={member}
          prayCardList={userIdPrayCardListHash[member.user_id || ""]}
        ></Member>
      ))}
    </div>
  );
};

export default MemberList;
