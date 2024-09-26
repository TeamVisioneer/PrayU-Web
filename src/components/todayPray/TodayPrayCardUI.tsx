import { PrayCardWithProfiles } from "supabase/types/tables";
import ReactionWithCalendar from "../prayCard/ReactionWithCalendar";
import { Textarea } from "../ui/textarea";
import { getISODateYMD } from "@/lib/utils";
import OtherPrayCardMenuBtn from "../prayCard/OtherPrayCardMenuBtn";
import useBaseStore from "@/stores/baseStore";

interface EventOption {
  where: string;
}

interface PrayCardProps {
  prayCard: PrayCardWithProfiles;
  listLength: number;
  listIndex: number;
  eventOption: EventOption;
}

const PrayCardUI: React.FC<PrayCardProps> = ({
  prayCard,
  listLength,
  listIndex,
  eventOption,
}) => {
  const createdAt = prayCard.created_at;
  const createdDateYMD = getISODateYMD(createdAt);
  const isPrayToday = useBaseStore((state) => state.isPrayToday);

  return (
    <div className="flex flex-col gap-2 min-h-80vh max-h-80vh">
      <div className="flex justify-between px-2">
        <div className="w-6"></div>
        <div className="text-sm text-gray-400">
          {listLength}명 중 {listIndex + 1}번째 기도
        </div>
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
          <Textarea
            className="flex-grow w-full p-2 rounded-md overflow-y-auto no-scrollbar text-black !opacity-100 !border-none !cursor-default"
            value={prayCard.content || ""}
            disabled={true}
          />
        </div>
      </div>
      <ReactionWithCalendar prayCard={prayCard} eventOption={eventOption} />
      <div className="text-gray-400 text-sm text-center">
        {isPrayToday ? (
          <div className="invisible">반응을 누르면 다음 기도로 넘어가요</div>
        ) : (
          <div>반응을 누르면 다음 기도로 넘어가요</div>
        )}
      </div>
    </div>
  );
};

export default PrayCardUI;
