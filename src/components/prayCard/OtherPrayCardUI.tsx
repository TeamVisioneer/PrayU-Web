import { useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import ReactionWithCalendar from "./ReactionWithCalendar";
import { getISODateYMD, getISOTodayDate } from "@/lib/utils";
import ExpiredPrayCardUI from "./ExpiredPrayCardUI";
import DeletedPrayCardUI from "./DeletedPrayCardUI";
import OtherPrayCardMenuBtn from "./OtherPrayCardMenuBtn";
import { Skeleton } from "../ui/skeleton";

interface OtherPrayCardProps {
  currentUserId: string;
  eventOption: { where: string; total_member: number };
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
      <div className="flex justify-center min-h-80vh max-h-80vh px-10 pt-[32px]">
        <Skeleton className="w-full h-[400px] flex items-center gap-4 p-4 bg-gray-200 rounded-xl" />
      </div>
    );
  }
  if (otherPrayCardList.length == 0) return <DeletedPrayCardUI />;
  if (otherPrayCardList[0].created_at < getISOTodayDate(-6))
    return <ExpiredPrayCardUI />;

  const prayCard = otherPrayCardList[0];
  const createdDateYMD = getISODateYMD(prayCard.created_at);

  return (
    <div className="flex flex-col px-10 gap-2 min-h-80vh max-h-80vh">
      <div className="flex justify-end px-2">
        <OtherPrayCardMenuBtn
          targetUserId={prayCard.user_id || ""}
          prayContent={prayCard.content || ""}
        />
      </div>
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
          <p className="flex-grow w-full p-2 rounded-md text-sm overflow-y-auto no-scrollbar whitespace-pre-wrap ">
            {prayCard.content || ""}
          </p>
        </div>
      </div>
      <ReactionWithCalendar prayCard={prayCard} eventOption={eventOption} />
    </div>
  );
};

export default OtherPrayCardUI;
