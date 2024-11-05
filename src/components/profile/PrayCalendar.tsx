import { useEffect, useState } from "react";
import { getISOTodayDate, getWeekInfo, getISODate, days } from "@/lib/utils";
import { hasPrayedByDate } from "@/apis/pray";
import useAuth from "@/hooks/useAuth";

const PrayCalendar = () => {
  const { user } = useAuth();
  const currentDate = getISOTodayDate();
  const weekInfo = getWeekInfo(currentDate);

  const [weeklyDays, setWeeklyDays] = useState<
    { date: string; hasPrayed: boolean }[]
  >([]);

  useEffect(() => {
    const generateDates = async (weekDates: string[]) => {
      const startDate = getISODate(new Date(weekDates[0]));
      const dateList = [];

      for (let i = 0; i < 7; i++) {
        const newDate = new Date(startDate);
        newDate.setDate(new Date(startDate).getDate() + i);
        const newDateString = getISODate(newDate).split("T")[0];

        const hasPrayed = await hasPrayedByDate(user!.id, newDate);

        dateList.push({ date: newDateString, hasPrayed });
      }
      return dateList;
    };

    // 비동기 함수 호출 후 상태 설정
    const fetchWeeklyDays = async () => {
      const dates = await generateDates(weekInfo.weekDates);
      setWeeklyDays(dates);
    };

    fetchWeeklyDays();
  }, [weekInfo.weekDates, user]);

  return (
    <div className="aspect-[2.5] w-full flex-grow flex flex-col gap-1 bg-white p-5 rounded-xl">
      <div className="flex flex-row justify-between">
        <span className="items-start text-sm font-semibold">기도 캘린더</span>
        <span className="text-right text-xs font-semibold">2024년 10월</span>
      </div>
      <div className="border-t border-[#f7f7f7] my-2"></div>
      <div className="w-full flex justify-around ">
        {weeklyDays.map((date) => {
          const isToday = date.date === currentDate;
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
                {hasPrayed ? (
                  <img src="/images/historyYes.png"></img>
                ) : (
                  <img src="/images/historyNo.png"></img>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrayCalendar;
