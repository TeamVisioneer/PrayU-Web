import {
  getISOTodayDate,
  getWeekInfo,
  days,
  getISODate,
  formatToDateString,
  isFutureDate,
} from "@/lib/utils";
import useBaseStore from "@/stores/baseStore";
import { Skeleton } from "@/components/ui/skeleton";
import historyToday from "@/assets/historyToday.png";
import historyYes from "@/assets/historyYes.png";

const PrayCalendar = () => {
  const currentDate = getISOTodayDate();
  const currentDateString = formatToDateString(currentDate);
  const prayListByDate = useBaseStore((state) => state.prayListByDate);
  const weekInfo = getWeekInfo(currentDate);
  const generateDates = (weekDates: string[], hasPrayedList: boolean[]) => {
    const startDate = getISODate(new Date(weekDates[0]));
    const dateList = [];

    for (let i = 0; i < 7; i++) {
      const newDate = new Date(startDate);
      newDate.setDate(new Date(startDate).getDate() + i);
      const newDateString = getISODate(newDate).split("T")[0];

      dateList.push({ date: newDateString, hasPrayed: hasPrayedList[i] });
    }
    return dateList;
  };

  // 페이지 로딩 게이트에서 빠졌다 — 달력 데이터는 여기서 직접 기다린다 (plans/my-profile-refresh.md)
  if (!prayListByDate) {
    return (
      <div className="w-full rounded-2xl border border-glassBorder/50 bg-surfaceCard/70 p-5 shadow-member">
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  const hasPrayedList = weekInfo.weekDates.map((date) =>
    prayListByDate.some((pray) => pray.created_at.split("T")[0] === date)
  );
  const weeklyDays = generateDates(weekInfo.weekDates, hasPrayedList);

  return (
    <div className="w-full flex-grow flex flex-col gap-1 rounded-2xl border border-glassBorder/50 bg-surfaceCard/70 p-5 shadow-member">
      <div className="flex flex-row justify-between">
        <span className="items-start text-sm font-semibold text-black">
          기도 캘린더
        </span>
      </div>
      <div className="border-t border-gray-100 my-2"></div>
      <div className="w-full flex justify-around ">
        {weeklyDays.map((date) => {
          const isToday = date.date === currentDateString;
          const hasPrayed = date.hasPrayed;
          const dayOfWeek = new Date(date.date).getDay();
          return (
            <div
              key={date.date}
              className="w-[10%] flex flex-col items-center gap-1"
            >
              <span
                className={`text-xs ${
                  isToday ? "font-bold text-black" : "text-deactivate"
                }`}
              >
                {days[dayOfWeek]}
              </span>
              {/* 안 기도한 날은 빈 원으로 둔다 — ✗ 표식은 죄책감 UI 라 쓰지 않는다 */}
              <div className="w-full aspect-square rounded-full flex items-center justify-center bg-mainBg">
                {!isFutureDate(currentDateString, date.date) &&
                  hasPrayed &&
                  (isToday ? (
                    <img src={historyToday} alt="오늘 기도함" />
                  ) : (
                    <img src={historyYes} alt="기도함" />
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrayCalendar;
