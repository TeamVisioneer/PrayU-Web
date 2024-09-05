import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import { getISODate, getISOToday } from "@/lib/utils";
import useBaseStore from "@/stores/baseStore";
import { PrayCardWithProfiles } from "supabase/types/tables";

interface WeeklyCalendarProps {
  prayCard: PrayCardWithProfiles;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ prayCard }) => {
  const todayPrayTypeHash = useBaseStore((state) => state.todayPrayTypeHash);

  const getReactionEmoticon = (prayType: string | null) => {
    return (
      <img
        src={PrayTypeDatas[prayType as PrayType]?.reactImg}
        alt={PrayTypeDatas[prayType as PrayType]?.emoji}
      ></img>
    );
  };

  const generateDates = (prayCard: PrayCardWithProfiles) => {
    const startDate = getISODate(new Date(prayCard.created_at));
    const dateList = [];

    for (let i = 0; i < 7; i++) {
      const newDate = new Date(startDate);
      newDate.setDate(new Date(startDate).getDate() + i);
      const newDateString = getISODate(newDate).split("T")[0];

      const pray = prayCard.pray.find((entry) => {
        const prayDate = getISODate(new Date(entry.created_at)).split("T")[0];
        return prayDate === newDateString;
      });

      const emoji = pray ? getReactionEmoticon(pray.pray_type) : "";
      dateList.push({ date: newDateString, emoji });
    }
    return dateList;
  };

  const currentDate = getISOToday().split("T")[0];
  const weeklyDays = generateDates(prayCard);

  return (
    <div className="flex justify-center gap-[13px]">
      {weeklyDays.map((date) => {
        const isToday = date.date === currentDate;
        const day = new Date(date.date).getDate(); // Extract the day part of the date
        return (
          <div key={date.date} className="flex flex-col items-center gap-1">
            <span
              className={`text-sm ${
                isToday ? "font-bold text-black" : "text-deactivate"
              }`}
            >
              {day}
            </span>
            <div
              className={`w-7 h-7 flex items-center justify-center rounded-[5px] bg-[#DEE0F1] ${
                isToday ? "border-[1.5px] border-[#BBBED4]" : ""
              } ${todayPrayTypeHash[prayCard.id] ? "border-none" : ""}`}
            >
              {isToday
                ? getReactionEmoticon(todayPrayTypeHash[prayCard.id])
                : date.emoji}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyCalendar;
