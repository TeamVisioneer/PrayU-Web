import { MemberWithProfiles } from "supabase/types/tables";
import { getISOOnlyDate, getISOTodayDate } from "../../lib/utils";
import { getDateDistance } from "@toss/date";
import { analyticsTrack } from "@/analytics/analytics";
import useBaseStore from "@/stores/baseStore";
import { UserProfile } from "../profile/UserProfile";

interface OtherMemberProps {
  member: MemberWithProfiles;
}

const OtherMember: React.FC<OtherMemberProps> = ({ member }) => {
  const user = useBaseStore((state) => state.user);
  const fetchOtherPrayCardListByGroupId = useBaseStore(
    (state) => state.fetchOtherPrayCardListByGroupId
  );
  const setOtherMember = useBaseStore((state) => state.setOtherMember);
  const setIsOpenOtherMemberDrawer = useBaseStore(
    (state) => state.setIsOpenOtherMemberDrawer
  );
  const setIsOpenLoginDrawer = useBaseStore(
    (state) => state.setIsOpenLoginDrawer
  );
  const dateDistance = getDateDistance(
    new Date(getISOOnlyDate(member.updated_at)),
    new Date(getISOTodayDate())
  );

  const onClickOtherMember = async () => {
    analyticsTrack("클릭_멤버_구성원", { member: member.user_id });
    if (!user) setIsOpenLoginDrawer(true);
    else {
      setIsOpenOtherMemberDrawer(true);
      setOtherMember(null);
      await fetchOtherPrayCardListByGroupId(
        user.id,
        member.user_id!,
        member.group_id!
      );
      setOtherMember(member);
    }
  };

  return (
    <div
      className="flex flex-col gap-[10px] cursor-pointer bg-white p-5 rounded-2xl"
      onClick={() => onClickOtherMember()}
    >
      <UserProfile profile={member.profiles} imgSize="w-8 h-8" fontSize="" />
      <div className="text-left text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis w-full block">
        {member.pray_summary}
      </div>
      <div className="text-gray-400 text-left text-xs">
        {dateDistance.days < 1 ? "오늘" : `${dateDistance.days}일 전`}
      </div>
    </div>
  );
};

export default OtherMember;
