import { useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import ReactionWithCalendar from "./ReactionWithCalendar";
import { Textarea } from "../ui/textarea";
import { getISOTodayDate } from "@/lib/utils";
import ExpiredPrayCardUI from "./ExpiredPrayCardUI";

interface EventOption {
  where: string;
}

interface OtherPrayCardProps {
  currentUserId: string;
  eventOption: EventOption;
}

const OtherPrayCardUI: React.FC<OtherPrayCardProps> = ({
  currentUserId,
  eventOption,
}) => {
  const otherPrayCardList = useBaseStore((state) => state.otherPrayCardList);
  const fetchOtherPrayCardListByGroupId = useBaseStore(
    (state) => state.fetchOtherPrayCardListByGroupId
  );
  const otherMember = useBaseStore((state) => state.otherMember);

  useEffect(() => {
    fetchOtherPrayCardListByGroupId(
      currentUserId,
      otherMember!.user_id!,
      otherMember!.group_id!
    );
  }, [fetchOtherPrayCardListByGroupId, currentUserId, otherMember]);

  if (!otherPrayCardList) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] max-h-[80vh]"></div>
    );
  }

  // TODO: PrayCardCreateModal 로 반환하기 ( 이미 GroupBody 에서 member.updated_at 으로 처리중 )
  if (otherPrayCardList.length === 0) return null;
  if (!otherMember) return null;

  const prayCard = otherPrayCardList[0];
  const isExpiredOtherMember = otherMember.updated_at < getISOTodayDate(-6);

  const PrayCardUI = () => (
    <div className="flex flex-col gap-6 min-h-[80vh] max-h-[80vh]">
      <div className="flex flex-col flex-grow min-h-full max-h-full bg-white rounded-2xl shadow-prayCard">
        <div className="flex flex-col justify-center items-start gap-1 bg-gradient-to-r from-start/60 via-middle/60 via-30% to-end/60 rounded-t-2xl p-5">
          <div className="flex items-center gap-2">
            <img
              src={otherMember.profiles.avatar_url || ""}
              className="w-7 h-7 rounded-full"
            />
            <p className="text-white text-lg">
              {otherMember.profiles.full_name}
            </p>
          </div>
          <p className="text-sm text-white w-full text-left">
            시작일 : {otherMember.updated_at.split("T")[0]}
          </p>
        </div>
        <div className="flex flex-col flex-grow min-h-full max-h-full items-start px-[10px] py-[10px] overflow-y-auto no-scrollbar">
          <Textarea
            className="flex-grow w-full p-2 rounded-md overflow-y-auto no-scrollbar text-black !opacity-100 !border-none !cursor-default"
            value={otherMember.pray_summary || ""}
            disabled={true}
          />
        </div>
      </div>
      <ReactionWithCalendar prayCard={prayCard} eventOption={eventOption} />
    </div>
  );

  return isExpiredOtherMember ? <ExpiredPrayCardUI /> : <PrayCardUI />;
};

export default OtherPrayCardUI;
