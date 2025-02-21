import useBaseStore from "@/stores/baseStore";
import WeeklyCalendar from "./WeeklyCalendar";
import { PrayCardWithProfiles } from "supabase/types/tables";
import ReactionBtn from "./ReactionBtn";

interface PrayCardProps {
  prayCard: PrayCardWithProfiles | undefined;
  eventOption: { where: string; total_member: number };
}

const ReactionWithCalendar: React.FC<PrayCardProps> = ({
  prayCard,
  eventOption,
}) => {
  const currentUserId = useBaseStore((state) => state.user?.id);

  if (!prayCard) {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return (
      <div className="flex flex-col gap-6 p-2">
        <div className="w-full flex justify-around">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="w-[10%] flex flex-col items-center gap-1">
              <span className="text-sm text-deactivate">{days[i]}</span>
              <div className="w-full aspect-square flex items-center justify-center rounded-sm bg-[#DEE0F1] opacity-50" />
            </div>
          ))}
        </div>
        <div className="w-full flex justify-around">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex justify-center items-center w-1/5 p-2 max-w-20 aspect-square rounded-full bg-gray-200 opacity-50"
            />
          ))}
        </div>
        <p className="text-gray-400 text-sm text-center invisible">
          기도 반응 버튼을 눌러 오늘의 기도를 남겨요
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 p-2">
      <WeeklyCalendar prayCard={prayCard} />
      <ReactionBtn
        currentUserId={currentUserId!}
        prayCard={prayCard}
        eventOption={eventOption}
      />
    </div>
  );
};

export default ReactionWithCalendar;
