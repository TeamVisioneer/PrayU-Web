import { useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import { ClipLoader } from "react-spinners";

interface MembersProps {
  currentUserId: string | undefined;
  groupId: string | undefined;
}

const Members: React.FC<MembersProps> = ({ currentUserId, groupId }) => {
  const userIdMemberHash = useBaseStore((state) => state.userIdMemberHash);
  const userIdPrayCardListHash = useBaseStore(
    (state) => state.userIdPrayCardListHash
  );
  const fetchPrayCardListByGroupId = useBaseStore(
    (state) => state.fetchPrayCardListByGroupId
  );
  const fetchMemberListByGroupId = useBaseStore(
    (state) => state.fetchMemberListByGroupId
  );

  useEffect(() => {
    fetchMemberListByGroupId(currentUserId, groupId);
    fetchPrayCardListByGroupId(groupId);
  }, [
    fetchMemberListByGroupId,
    fetchPrayCardListByGroupId,
    currentUserId,
    groupId,
  ]);

  if (!userIdMemberHash || !userIdPrayCardListHash) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  if (!userIdPrayCardListHash[currentUserId || ""]) {
    return <div>기도카드 작성 모달</div>;
  }
  return <div>기도카드 리스트</div>;
};

export default Members;
