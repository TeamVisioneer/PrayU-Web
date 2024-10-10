import OtherMember from "./OtherMember";
import TodayPrayBtn from "../todayPray/TodayPrayBtn";
import { MemberWithProfiles } from "supabase/types/tables";

interface OtherMembersProps {
  otherMemberList: MemberWithProfiles[];
}

const OtherMemberList: React.FC<OtherMembersProps> = ({ otherMemberList }) => {
  return (
    <div className="flex flex-col gap-2 pb-10">
      <div className="text-sm text-gray-500 p-2">기도 구성원</div>
      <div className="flex flex-col gap-4">
        {otherMemberList.map((member) => (
          <OtherMember key={member.id} member={member}></OtherMember>
        ))}
      </div>
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2">
        <TodayPrayBtn eventOption={{ where: "OtherMemberList" }} />
      </div>
    </div>
  );
};

export default OtherMemberList;
