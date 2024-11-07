import {
  getISOTodayDate,
  getWeekInfo,
  days,
  getISODate,
  formatToDateString,
  isFutureDate,
} from "@/lib/utils";
import useBaseStore from "@/stores/baseStore";

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

  const hasPrayedList = weekInfo.weekDates.map((date) =>
    prayListByDate!.some((pray) => pray.created_at.split("T")[0] === date)
  );
  const weeklyDays = generateDates(weekInfo.weekDates, hasPrayedList);

  return (
    <div className="aspect-[2.5] w-full flex-grow flex flex-col gap-1 bg-white p-5 rounded-xl">
      <div className="flex flex-row justify-between">
        <span className="items-start text-sm font-semibold">기도 캘린더</span>
      </div>
      <div className="border-t border-[#f7f7f7] my-2"></div>
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
              <div className="w-full aspect-square rounded-full flex items-center justify-center bg-[#EFEFEF] ">
                {!isFutureDate(currentDateString, date.date) &&
                  (hasPrayed ? (
                    isToday ? (
                      <img src="/images/historyToday.png" alt="Today Prayed" />
                    ) : (
                      <img src="/images/historyYes.png" alt="Prayed" />
                    )
                  ) : (
                    !isToday && (
                      <img src="/images/historyNo.png" alt="Not Prayed" />
                    )
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
