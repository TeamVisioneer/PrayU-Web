import React from "react";
import { Textarea } from "../ui/textarea";
import { getISOTodayDateYMD } from "@/lib/utils";
import DumyReactionBtnWithCalendar from "./DumyReactionWithCalendar";


interface DumyPrayCardProps {
  profileImage: string;
  name: string;
  content: string;
}

const DumyPrayCardUI: React.FC<DumyPrayCardProps> = ({
  profileImage,
  name,
  content,
}) => {
  
  const createdDateYMD = getISOTodayDateYMD();

  return (
    <div className="flex flex-col gap-2 min-h-80vh max-h-80vh">
      <div className="flex justify-center">
        <p className="text-sm text-gray-400">
          반응을 누르면 다음 기도로 넘어가요
        </p>
      </div>
      <div className="flex flex-col flex-grow min-h-full max-h-full bg-white rounded-2xl shadow-prayCard">
        <div className="flex flex-col justify-center items-start gap-1 bg-gradient-to-r from-start via-middle via-52% to-end rounded-t-2xl p-5">
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
          <p className="text-sm text-white w-full text-left">
            시작일 : {createdDateYMD.year}.{createdDateYMD.month}.
            {createdDateYMD.day}
          </p>
        </div>
        <div className="flex flex-col flex-grow min-h-full max-h-full items-start px-[10px] py-[10px] overflow-y-auto no-scrollbar">
          <Textarea
            className="flex-grow w-full p-2 rounded-md overflow-y-auto no-scrollbar text-black !opacity-100 !border-none !cursor-default"
            value={content || ""}
            disabled={true}
          />
        </div>
      </div>
      <DumyReactionBtnWithCalendar />
    </div>
  );
};

export default DumyPrayCardUI;
