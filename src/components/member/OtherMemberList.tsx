import { useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import { ClipLoader } from "react-spinners";
import { userIdPrayCardListHash } from "../../../supabase/types/tables";
import OtherMember from "./OtherMember";
import { getISOTodayDate } from "@/lib/utils";

interface OtherMembersProps {
  currentUserId: string;
  groupId: string | undefined;
}

const OtherMemberList: React.FC<OtherMembersProps> = ({
  currentUserId,
  groupId,
}) => {
  const memberList = useBaseStore((state) => state.memberList);
  const groupPrayCardList = useBaseStore((state) => state.groupPrayCardList);
  const fetchGroupPrayCardList = useBaseStore(
    (state) => state.fetchGroupPrayCardList
  );

  const startDt = getISOTodayDate(-6);
  const endDt = getISOTodayDate(1);

  useEffect(() => {
    fetchGroupPrayCardList(groupId, startDt, endDt);
  }, [fetchGroupPrayCardList, groupId, startDt, endDt]);

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

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-gray-950 p-2">
        Members ({otherMembers.length})
      </div>
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
    </div>
  );
};

export default OtherMemberList;
