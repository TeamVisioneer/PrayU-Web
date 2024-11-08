import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import { getISODate, getISOToday, days, getWeekInfo } from "@/lib/utils";
import useBaseStore from "@/stores/baseStore";
import { PrayCardWithProfiles } from "supabase/types/tables";

interface WeeklyCalendarProps {
  prayCard: PrayCardWithProfiles;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ prayCard }) => {
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

  const generateDates = (prayCard: PrayCardWithProfiles) => {
    const startDate = getWeekInfo(prayCard.created_at).weekDates[0];
    const dateList = [];

    for (let i = 0; i < 7; i++) {
      const newDate = new Date(startDate);
      newDate.setDate(new Date(startDate).getDate() + i);
      const newDateString = getISODate(newDate).split("T")[0];

      const pray = prayCard.pray.find((entry) => {
        const prayDate = getISODate(new Date(entry.created_at)).split("T")[0];
        return prayDate === newDateString;
      });

      dateList.push({ date: newDateString, prayType: pray?.pray_type || null });
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
            <div className="w-full aspect-square flex items-center justify-center rounded-sm bg-[#DEE0F1]">
              {isToday
                ? getReactionEmoticon(todayPrayTypeHash[prayCard.id], isToday)
                : getReactionEmoticon(date.prayType, isToday)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyCalendar;
