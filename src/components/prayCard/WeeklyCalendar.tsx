import { PrayType } from "@/Enums/prayType";
import { getISODate, getISOToday } from "@/lib/utils";
import useBaseStore from "@/stores/baseStore";
import { Pray, PrayCardWithProfiles } from "supabase/types/tables";

interface WeeklyCalendarProps {
  prayCard: PrayCardWithProfiles | null;
  prayData: Pray[];
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  prayCard,
  prayData,
}) => {
  const todayPrayTypeHash = useBaseStore((state) => state.todayPrayTypeHash);
  const reactionDatas = useBaseStore((state) => state.reactionDatas);

  const getReactionEmoticon = (prayType: string | null) => {
    return (
      <img
        src={reactionDatas[prayType as PrayType]?.img}
        alt={reactionDatas[prayType as PrayType]?.emoji}
      ></img>
    );
  };

  const generateDates = (createdAt: string | undefined, prayData: Pray[]) => {
    if (!createdAt) return [];
    const startDate = getISODate(createdAt);
    const dateList = [];

    for (let i = 0; i < 7; i++) {
      const newDate = new Date(startDate);
      newDate.setDate(new Date(startDate).getDate() + i);
      const newDateString = newDate.toISOString().split("T")[0];

      const pray = prayData.find((entry) => {
        const prayDate = getISODate(entry.created_at).split("T")[0];
        return prayDate === newDateString;
      });

      const emoji = pray ? getReactionEmoticon(pray.pray_type) : "";
      dateList.push({ date: newDateString, emoji });
    }
    return dateList;
  };

  const currentDate = getISOToday().split("T")[0];
  const weeklyDays = generateDates(prayCard?.created_at, prayData);

  return (
    <div className="flex justify-around">
      {weeklyDays.map((date) => {
        const isToday = date.date === currentDate;
        const day = new Date(date.date).getDate(); // Extract the day part of the date
        return (
          <div key={date.date} className="flex flex-col items-center">
            <span
              className={`text-sm ${
                isToday ? "font-bold text-black" : "text-gray-400"
              }`}
            >
              {day}
            </span>
            <div
              className={`w-8 h-8 flex items-center justify-center rounded ${
                isToday ? "bg-red-100" : "bg-gray-200"
              }`}
            >
              <span
                className={`text-2xl ${
                  isToday ? "text-red-500" : "text-gray-500"
                }`}
              >
                {isToday
                  ? getReactionEmoticon(todayPrayTypeHash[prayCard?.id || ""])
                  : date.emoji}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyCalendar;
