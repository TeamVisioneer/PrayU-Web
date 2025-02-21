import {
  getISODate,
  getISOToday,
  getISOTodayDate,
  sleep,
  days,
  getWeekInfo,
} from "@/lib/utils";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import { useState, useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import { analyticsTrack } from "@/analytics/analytics";

const DumyReactionBtnWithCalendar = () => {
  const isPrayToday = useBaseStore((state) => state.isPrayToday);
  const prayCardCarouselApi = useBaseStore(
    (state) => state.prayCardCarouselApi
  );
  const setIsPrayToday = useBaseStore((state) => state.setIsPrayToday);

  const [todayPrayType, setTodayPrayType] = useState("");
  const [randomPrayTypes, setRandomPrayTypes] = useState<string[]>([]);

  useEffect(() => {
    const initialRandomPrayTypes = generateRandomPrayTypes();
    setRandomPrayTypes(initialRandomPrayTypes);
  }, []);

  const handleClick = (type: PrayType) => {
    analyticsTrack("클릭_기도카드_반응", {
      where: "DummyReactionBtnWithCalendar",
    });
    setTodayPrayType(type);
    setIsPrayToday(true);
    if (prayCardCarouselApi) {
      sleep(1000).then(() => {
        prayCardCarouselApi.scrollNext();
      });
    }
  };

  const currentDate = getISOTodayDate();

  const generateDates = () => {
    const startDate = getWeekInfo(currentDate).weekDates[0];
    const dateList = [];

    for (let i = 0; i < 7; i++) {
      const newDate = new Date(startDate);
      newDate.setDate(new Date(startDate).getDate() + i);
      const newDateString = getISODate(newDate).split("T")[0];

      dateList.push({ date: newDateString, emoji: "" });
    }
    return dateList;
  };

  const generateRandomPrayTypes = () => {
    const prayTypes = Object.values(PrayType);
    return Array(7)
      .fill(null)
      .map(() => prayTypes[Math.floor(Math.random() * prayTypes.length)]);
  };

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

  const weeklyDays = generateDates();

  return (
    <div className="flex flex-col gap-6 p-2">
      <div className="flex justify-around">
        {weeklyDays.map((date, index) => {
          const isToday = date.date === getISOToday().split("T")[0];
          const isPast =
            new Date(date.date) < new Date(getISOToday().split("T")[0]);

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
                  ? getReactionEmoticon(todayPrayType, isToday)
                  : isPast
                  ? getReactionEmoticon(randomPrayTypes[index], isToday)
                  : date.emoji}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-around">
        {Object.values(PrayType).map((type) => {
          const emojiData = PrayTypeDatas[type];
          const isSelected = todayPrayType === type;
          const isNotSelected = todayPrayType !== "" && !isSelected;
          return (
            <div key={type} className="relative w-1/5 max-w-20">
              <button
                className={`p-2 w-full aspect-square rounded-full flex justify-center items-center duration-1000 ease-in-out ${
                  emojiData.bgColor
                } ${!isPrayToday && "animate-pulse"} ${
                  isNotSelected
                    ? `opacity-20 ${emojiData.shadowColor}`
                    : `opacity-90 ${
                        isSelected
                          ? `ring-4 ring-offset-2 ${emojiData.ringColor}`
                          : emojiData.shadowColor
                      }`
                }`}
                onClick={() => handleClick(type)}
              >
                <img src={emojiData.icon} className="w-3/4 h-3/4" />
              </button>
              {type == PrayType.PRAY && !todayPrayType && (
                <span className="absolute -top-2 -right-3 text-white bg-black text-xs rounded-xl px-2 py-1">
                  클릭
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DumyReactionBtnWithCalendar;
