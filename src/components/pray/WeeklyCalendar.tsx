import { PrayCardWithProfiles } from "supabase/types/tables";
import { getISOTodayDate, getISODate, getWeekInfo } from "@/lib/utils";
import { PrayType } from "@/Enums/prayType";
import { PrayTypeDatas } from "@/Enums/prayType";
import useBaseStore from "@/stores/baseStore";

interface WeeklyCalendarProps {
  prayCard: PrayCardWithProfiles | undefined;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ prayCard }) => {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const todayDate = getISOTodayDate();
  const todayDayNumber = new Date(todayDate).getDay();
  const weekDates = getWeekInfo(todayDate).weekDates;
  const todayPrayTypeHash = useBaseStore((state) => state.todayPrayTypeHash);

  const getReactionEmoticon = (prayType: string | null, isToday: boolean) => {
    return (
      <img
        src={PrayTypeDatas[prayType as PrayType]?.reactImg}
        className={
          prayType
            ? "w-full h-full rounded-sm"
            : isToday
            ? "w-full h-full rounded-sm border-[1.5px] border-[#BBBED4]"
            : ""
        }
      />
    );
  };

  if (!prayCard) return null;

  return (
    <div className="w-fuil flex justify-around ">
      {weekDates.map((date, index) => {
        const dayNumber = new Date(date).getDay();
        const isToday = index === todayDayNumber;
        const pray = prayCard.pray.find((pray) => {
          const prayDate = getISODate(new Date(pray.created_at)).split("T")[0];
          return prayDate === date;
        });

        return (
          <div key={date} className="w-[10%] flex flex-col items-center gap-1">
            <span
              className={`text-sm ${
                isToday ? "font-bold text-black" : "text-deactivate"
              }`}
            >
              {days[dayNumber]}
            </span>
            <div className="w-full aspect-square flex items-center justify-center rounded-sm bg-[#DEE0F1]">
              {isToday
                ? getReactionEmoticon(todayPrayTypeHash[prayCard.id], isToday)
                : getReactionEmoticon(pray?.pray_type || null, isToday)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyCalendar;
