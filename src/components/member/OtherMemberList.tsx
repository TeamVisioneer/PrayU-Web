import { useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import OtherMember from "./OtherMember";
import MemberInviteCard from "./MemberInviteCard";
import TodayPrayBtn from "../todayPray/TodayPrayBtn";
import TodayPrayStartCard from "../todayPray/TodayPrayStartCard";

interface OtherMembersProps {
  currentUserId: string;
  groupId: string;
}

const OtherMemberList: React.FC<OtherMembersProps> = ({
  currentUserId,
  groupId,
}) => {
  const isPrayToday = useBaseStore((state) => state.isPrayToday);
  const fetchIsPrayToday = useBaseStore((state) => state.fetchIsPrayToday);
  const memberList = useBaseStore((state) => state.memberList);

  useEffect(() => {
    fetchIsPrayToday(currentUserId, groupId);
  }, [currentUserId, fetchIsPrayToday, groupId]);

  if (isPrayToday == null || !memberList) return null;
  if (memberList.length === 1) return <MemberInviteCard />;
  if (!isPrayToday) return <TodayPrayStartCard />;

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-gray-500 p-2">기도 구성원</div>
      <div className="flex flex-col gap-4">
        {memberList.map((member) => {
          if (member.user_id !== currentUserId)
            return (
              <OtherMember
                key={member.id}
                currentUserId={currentUserId}
                member={member}
              ></OtherMember>
            );
        })}
      </div>
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2">
        <TodayPrayBtn eventOption={{ where: "OtherMemberList" }} />
      </div>
    </div>
  );
};

export default OtherMemberList;
