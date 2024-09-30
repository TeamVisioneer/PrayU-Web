import React from "react";
import DumyReactionBtnWithCalendar from "./DummyReactionWithCalendar";

interface DumyPrayCardProps {
  profileImage: string;
  name: string;
  content: string;
  dayOffset: number;
}

const DumyPrayCardUI: React.FC<DumyPrayCardProps> = ({
  profileImage,
  name,
  content,
  dayOffset,
}) => {
  return (
    <div className="flex flex-col gap-2 min-h-80vh max-h-80vh">
      <div className="flex flex-col flex-grow min-h-full max-h-full bg-white rounded-2xl shadow-prayCard">
        <div className="flex flex-col justify-center items-start gap-2 bg-gradient-to-r from-start via-middle via-52% to-end rounded-t-2xl p-5">
          <div className="flex items-center gap-2">
            <img
              src={profileImage || "/images/defaultProfileImage.png"}
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                e.currentTarget.src = "/images/defaultProfileImage.png";
              }}
              className="w-7 h-7 rounded-full object-cover"
            />
            <p className="text-white text-lg">{name}</p>
          </div>
          <p className="text-sm text-white text-left">
            본 기도카드는 예시 기도카드입니다.
          </p>
        </div>
        <div className="flex flex-col flex-grow min-h-full max-h-full items-start px-[10px] py-[10px] overflow-y-auto no-scrollbar">
          <p className="flex-grow w-full p-2 rounded-md text-sm overflow-y-auto no-scrollbar whitespace-pre-wrap ">
            {content}
          </p>
        </div>
      </div>
      <DumyReactionBtnWithCalendar dayOffset={dayOffset} />
      <div className="text-gray-400 text-sm text-center">
        반응을 누르면 다음 기도로 넘어가요
      </div>
    </div>
  );
};

export default DumyPrayCardUI;
