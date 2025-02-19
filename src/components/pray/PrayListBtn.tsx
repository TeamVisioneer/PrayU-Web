import React from "react";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import { analyticsTrack } from "@/analytics/analytics";
import useBaseStore from "@/stores/baseStore";
import { Pray } from "supabase/types/tables";
import UserMono from "@/assets/icon-user-mono.svg";

interface PrayListBtnProps {
  prayDatas?: Pray[] | undefined;
}

const PrayListBtn: React.FC<PrayListBtnProps> = ({ prayDatas }) => {
  const setIsOpenMyPrayDrawer = useBaseStore(
    (state) => state.setIsOpenMyPrayDrawer
  );

  const onClickPrayerList = () => {
    setIsOpenMyPrayDrawer(true);
    analyticsTrack("클릭_기도카드_반응결과", { where: "MyPrayCard" });
  };

  return (
    <div
      className="flex justify-center focus:outline-none gap-2 mt-4"
      onClick={onClickPrayerList}
    >
      {Object.values(PrayType).map((type) => (
        <div
          key={type}
          className="w-[60px] py-1 px-2 flex rounded-lg bg-white text-black gap-2"
        >
          <div className="text-sm w-5 h-5">
            <img
              src={PrayTypeDatas[type].img}
              alt={PrayTypeDatas[type].emoji}
              className="w-5 h-5"
            />
          </div>
          <div className="text-sm">
            {prayDatas?.filter((pray) => pray.pray_type === type).length || 0}
          </div>
        </div>
      ))}
      <div className="bg-white rounded-lg flex justify-center items-center p-1">
        <img className="w-5" src={UserMono} />
      </div>
    </div>
  );
};

export default PrayListBtn;
