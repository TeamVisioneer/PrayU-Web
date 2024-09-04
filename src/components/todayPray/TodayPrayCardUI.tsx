import { PrayCardWithProfiles } from "supabase/types/tables";
import ReactionWithCalendar from "../prayCard/ReactionWithCalendar";
import { Textarea } from "../ui/textarea";
import { getISODateYMD } from "@/lib/utils";

interface EventOption {
  where: string;
}

interface PrayCardProps {
  prayCard: PrayCardWithProfiles;
  eventOption: EventOption;
}

// TODO: 현재 TodayPray 에서의 PrayCard 를 위한 컴포넌트로 사용중, 이후 이름 수정 및 폴더링 예정
const PrayCardUI: React.FC<PrayCardProps> = ({ prayCard, eventOption }) => {
  const createdAt = prayCard.created_at;
  const createdDateYMD = getISODateYMD(createdAt);
  return (
    <div className="flex flex-col gap-2 min-h-80vh max-h-80vh">
      <div className="flex flex-col flex-grow min-h-full max-h-full bg-white rounded-2xl shadow-prayCard">
        <div className="flex flex-col justify-center items-start gap-1 bg-gradient-to-r from-start/60 via-middle/60 via-30% to-end/60 rounded-t-2xl p-5">
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
};

export default PrayCardUI;
