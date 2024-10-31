import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import { getISODate, getISOToday, days } from "@/lib/utils";
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
        className="w-full h-full"
      />
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
    <div className="w-fuil flex justify-around ">
      {weeklyDays.map((date) => {
        const isToday = date.date === currentDate;
        const dayOfWeek = new Date(date.date).getDay();
        return (
          <div
            key={date.date}
            className="w-[10%] flex flex-col items-center gap-1"
          >
            <span
              className={`text-sm ${
                isToday ? "font-bold text-black" : "text-deactivate"
              }`}
            >
              {days[dayOfWeek]}
            </span>
            <div
              className={`w-full aspect-square flex items-center justify-center rounded-[5px] bg-[#DEE0F1] ${
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
