import { getISODate, getISOToday, getISOTodayDate, sleep } from "@/lib/utils";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import { useState } from "react";
import useBaseStore from "@/stores/baseStore";
import { analyticsTrack } from "@/analytics/analytics";


  const DumyReactionBtnWithCalendar = () => {
    const prayCardCarouselApi = useBaseStore(
      (state) => state.prayCardCarouselApi
    );

    const [todayPrayType, setTodayPrayType] = useState("");
    const handleClick = (type: PrayType) => {
      analyticsTrack("클릭_기도카드_반응", {
        where: "DummyReactionBtnWithCalendar",
      });
      setTodayPrayType(type);
      if (prayCardCarouselApi) {
        sleep(500).then(() => {
          prayCardCarouselApi.scrollNext();
        });
      }
    };

    const currentDate = getISOTodayDate();
    const generateDates = () => {
      const dateList = [];
      for (let i = 0; i < 7; i++) {
        const newDate = new Date(currentDate);
        newDate.setDate(new Date(currentDate).getDate() + i);
        const newDateString = getISODate(newDate).split("T")[0];
        dateList.push({ date: newDateString, emoji: "" });
      }
      return dateList;
    };

    const getReactionEmoticon = (prayType: string | null) => {
      return (
        <img
          src={PrayTypeDatas[prayType as PrayType]?.reactImg}
          alt={PrayTypeDatas[prayType as PrayType]?.emoji}
        ></img>
      );
    };

    const weeklyDays = generateDates();

    return (
      <div className="flex flex-col gap-6 p-2">
        
        <div className="flex justify-center gap-[13px]">
          {weeklyDays.map((date) => {
            const isToday = date.date === getISOToday().split("T")[0];
            const day = new Date(date.date).getDate();
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
                  } ${todayPrayType ? "border-none" : ""}`}
                >
                  {isToday
                    ? getReactionEmoticon(todayPrayType)
                    : date.emoji}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-[30px]">
          {Object.values(PrayType).map((type) => {
            const emojiData = PrayTypeDatas[type];
            const isSelected = todayPrayType === type;
            const isNotSelected = todayPrayType !== "" && !isSelected;
            return (
              <button
                key={type}
                className={`flex justify-center items-center w-[65px] h-[65px] rounded-full ${
                  emojiData.bgColor
                } ${
                  isNotSelected
                    ? `opacity-20 ${emojiData.shadowColor}`
                    : `opacity-90 ${isSelected ? `ring-4 ring-offset-2 ${emojiData.ringColor}` : emojiData.shadowColor}`
                }`}
                onClick={() => handleClick(type)}
              >
                <img src={emojiData.icon} className="w-9 h-9" />
              </button>
            );
          })}
        </div>
      </div>
      
    );
  };

export default DumyReactionBtnWithCalendar;