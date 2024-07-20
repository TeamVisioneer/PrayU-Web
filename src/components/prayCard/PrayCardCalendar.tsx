import { getISODate, getISOToday } from "@/lib/utils";
import useBaseStore from "@/stores/baseStore";
import { Pray, PrayCard } from "supabase/types/tables";

interface PrayCardCalendarProps {
  prayCard: PrayCard | undefined;
  prayData: Pray[];
}

const PrayCardCalender: React.FC<PrayCardCalendarProps> = ({
  prayCard,
  prayData,
}) => {
  const todayPrayType = useBaseStore((state) => state.todayPrayType);

  const getEmoji = (prayType: string | null) => {
    if (prayType === "pray") return "🙏";
    if (prayType === "good") return "👍";
    if (prayType === "like") return "❤️";
    return "";
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

      const emoji = pray ? getEmoji(pray.pray_type) : "";
      dateList.push({ date: newDateString, emoji });
    }
    return dateList;
  };

  const currentDate = getISOToday().split("T")[0];
  const weeklyDays = generateDates(prayCard?.created_at, prayData);

  return (
    <div className="flex justify-center space-x-4">
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
                {isToday ? getEmoji(todayPrayType) : date.emoji}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PrayCardCalender;
