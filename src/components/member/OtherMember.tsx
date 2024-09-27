import { MemberWithProfiles } from "supabase/types/tables";
import { getISOOnlyDate, getISOTodayDate } from "../../lib/utils";
import { getDateDistance } from "@toss/date";
import { analyticsTrack } from "@/analytics/analytics";
import useBaseStore from "@/stores/baseStore";

interface OtherMemberProps {
  member: MemberWithProfiles;
}

const OtherMember: React.FC<OtherMemberProps> = ({ member }) => {
  const setOtherMember = useBaseStore((state) => state.setOtherMember);
  const setIsOpenOtherMemberDrawer = useBaseStore(
    (state) => state.setIsOpenOtherMemberDrawer
  );
  const dateDistance = getDateDistance(
    new Date(getISOOnlyDate(member.updated_at)),
    new Date(getISOTodayDate())
  );

  const onClickOtherMember = () => {
    analyticsTrack("클릭_멤버_구성원", { member: member.user_id });
    setOtherMember(member);
    setIsOpenOtherMemberDrawer(true);
  };

  return (
    <div
      className="flex flex-col gap-[10px] cursor-pointer bg-white p-5 rounded-2xl shadow-member"
      onClick={() => onClickOtherMember()}
    >
      <div className="flex items-center gap-2">
        <img
          src={member.profiles.avatar_url || "/images/defaultProfileImage.png"}
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            e.currentTarget.src = "/images/defaultProfileImage.png";
          }}
          className="w-8 h-8 rounded-full object-cover"
        />
        <h3>{member.profiles.full_name}</h3>
      </div>
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
