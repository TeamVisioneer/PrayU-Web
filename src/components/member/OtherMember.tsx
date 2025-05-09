import { MemberWithProfiles } from "supabase/types/tables";
import {
  getISOOnlyDate,
  getISOTodayDate,
  isCurrentWeek,
} from "../../lib/utils";
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

  const onClickOtherMember = async () => {
    analyticsTrack("클릭_멤버_구성원", { member: member.user_id });
    if (!user) setIsOpenLoginDrawer(true);
    else {
      setIsOpenOtherMemberDrawer(true);
      setOtherMember(member);
      await fetchOtherPrayCardListByGroupId(
        user.id,
        member.user_id!,
        member.group_id!
      );
    }
  };

  const dateDistanceText = () => {
    const dateDistance = getDateDistance(
      new Date(getISOOnlyDate(member.updated_at)),
      new Date(getISOTodayDate())
    );
    if (dateDistance.days < 1) return "오늘";
    else if (dateDistance.days < 7) return `${dateDistance.days}일 전`;
    else if (dateDistance.days < 30)
      return `${Math.floor(dateDistance.days / 7)}주 전`;
    else if (dateDistance.days < 365)
      return `${Math.floor(dateDistance.days / 30)}달 전`;
    else return "오래 전";
  };

  const isExpired = member.pray_summary && !isCurrentWeek(member.updated_at);

  return (
    <div
      className="flex flex-col gap-[10px] cursor-pointer bg-white p-5 rounded-2xl h-32"
      onClick={() => onClickOtherMember()}
    >
      {member.profiles && (
        <div className="flex items-center justify-between">
          <UserProfile
            profile={member.profiles}
            imgSize="w-8 h-8"
            fontSize=""
          />
          {isExpired && (
            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
              만료됨
            </span>
          )}
        </div>
      )}

      {member.pray_summary ? (
        <div className="text-left text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis w-full block">
          {member.pray_summary}
        </div>
      ) : (
        <div className="text-left text-sm text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis w-full block">
          아직 기도카드가 작성되지 않았어요
        </div>
      )}
      <div className="text-gray-400 text-left text-xs">
        {dateDistanceText()}
      </div>
    </div>
  );
};

export default OtherMember;
