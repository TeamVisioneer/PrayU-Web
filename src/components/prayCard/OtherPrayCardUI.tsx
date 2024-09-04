import { useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import ReactionWithCalendar from "./ReactionWithCalendar";
import { Textarea } from "../ui/textarea";
import { getISODateYMD, getISOTodayDate } from "@/lib/utils";
import ExpiredPrayCardUI from "./ExpiredPrayCardUI";
import { ClipLoader } from "react-spinners";

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
      <div className="flex justify-center items-center min-h-80vh max-h-80vh">
        <ClipLoader size={20} color={"#70AAFF"} loading={true} />
      </div>
    );
  }

  if (!otherMember) return null;
  if (otherPrayCardList && otherPrayCardList.length == 0) {
    // TODO: 예외처리 필요
    return null;
  }

  const prayCard = otherPrayCardList[0];
  const isExpiredOtherMember = prayCard.created_at < getISOTodayDate(-6);
  const createdDateYMD = getISODateYMD(prayCard.created_at);

  const PrayCardUI = () => (
    <div className="flex flex-col gap-2 min-h-80vh max-h-80vh">
      <div className="flex flex-col flex-grow min-h-full max-h-full bg-white rounded-2xl shadow-prayCard">
        <div className="flex flex-col justify-center items-start gap-1 bg-gradient-to-r from-start via-middle via-52% to-end rounded-t-2xl p-5">
          <div className="flex items-center gap-2">
            <img
              src={
                prayCard.profiles.avatar_url ||
                "/images/defaultProfileImage.png"
              }
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                e.currentTarget.src = "/images/defaultProfileImage.png";
              }}
              className="w-7 h-7 rounded-full object-cover"
            />
            <p className="text-white text-lg">{prayCard.profiles.full_name}</p>
          </div>
          <p className="text-sm text-white w-full text-left">
            시작일 : {createdDateYMD.year}.{createdDateYMD.month}.
            {createdDateYMD.day}
          </p>
        </div>
        <div className="flex flex-col flex-grow min-h-full max-h-full items-start px-[10px] py-[10px] overflow-y-auto no-scrollbar">
          <Textarea
            className="flex-grow w-full p-2 rounded-md overflow-y-auto no-scrollbar text-black !opacity-100 !border-none !cursor-default"
            value={prayCard.content || ""}
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
