import useBaseStore from "@/stores/baseStore";
import ReactionWithCalendar from "./ReactionWithCalendar";
import { getISODateYMD, isPastWeek } from "@/lib/utils";
import ExpiredPrayCardUI from "./ExpiredPrayCardUI";
import DeletedPrayCardUI from "./DeletedPrayCardUI";
import OtherPrayCardMenuBtn from "./OtherPrayCardMenuBtn";
import ClipLoader from "react-spinners/ClipLoader";

interface OtherPrayCardProps {
  eventOption: { where: string; total_member: number };
}

const OtherPrayCardUI: React.FC<OtherPrayCardProps> = ({ eventOption }) => {
  const otherPrayCardList = useBaseStore((state) => state.otherPrayCardList);
  const otherMember = useBaseStore((state) => state.otherMember);

  if (!otherPrayCardList || !otherMember) {
    return (
      <div className="flex justify-center items-center min-h-80vh max-h-80vh">
        <ClipLoader color="#70AAFF" size={20} />
      </div>
    );
  }
  if (otherPrayCardList.length == 0) return <DeletedPrayCardUI />;

  if (isPastWeek(otherPrayCardList[0].created_at)) return <ExpiredPrayCardUI />;

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
