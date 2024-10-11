import OtherMember from "./OtherMember";
import TodayPrayBtn from "../todayPray/TodayPrayBtn";
import { MemberWithProfiles } from "supabase/types/tables";
import DummyOtherMember from "./DummyOtherMember";
import InviteBanner from "../notice/InviteBanner";
import RewardBanner from "../notice/RewardBanner";
import useBaseStore from "@/stores/baseStore";

interface OtherMembersProps {
  otherMemberList: MemberWithProfiles[];
}

const OtherMemberList: React.FC<OtherMembersProps> = ({ otherMemberList }) => {
  const groupList = useBaseStore((state) => state.groupList);
  const memberList = useBaseStore((state) => state.memberList);

  if (!groupList || !memberList) return;

  return (
    <div className="flex flex-col gap-2 pb-10">
      <div className="text-sm text-gray-500 p-2">기도 구성원</div>
      <div className="flex flex-col gap-4">
        {groupList.length == 1 &&
          (otherMemberList.length == 0 ? <InviteBanner /> : <RewardBanner />)}
        {otherMemberList.length == 0 && <DummyOtherMember />}
        {otherMemberList.map((member) => (
          <OtherMember key={member.id} member={member}></OtherMember>
        ))}
      </div>
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2">
        <TodayPrayBtn
          eventOption={{
            where: "OtherMemberList",
            total_member: memberList.length,
          }}
        />
      </div>
    </div>
  );
};

export default OtherMemberList;
