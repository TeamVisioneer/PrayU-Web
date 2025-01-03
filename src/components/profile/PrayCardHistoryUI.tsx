import useBaseStore from "@/stores/baseStore";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import { getISODateYMD } from "@/lib/utils";
import iconUserMono from "@/assets/icon-user-mono.svg";
import { analyticsTrack } from "@/analytics/analytics";
import { Textarea } from "../ui/textarea";
import { useRef } from "react";

const PrayCardHistoryUI: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const prayCard = useBaseStore((state) => state.historyCard);
  const setIsOpenMyPrayDrawer = useBaseStore(
    (state) => state.setIsOpenMyPrayDrawer
  );

  const onClickPrayerList = () => {
    setIsOpenMyPrayDrawer(true);
    analyticsTrack("클릭_기도카드_히스토리_반응결과", {
      where: "PrayCardHistory",
    });
  };

  const createdDateYMD = getISODateYMD(prayCard!.created_at);

  const MyPrayCardBody = (
    <div className="flex flex-col flex-grow">
      <div className="flex flex-col bg-white rounded-2xl shadow-prayCard flex-grow">
        <div className="bg-gradient-to-r from-start via-middle via-52% to-end flex flex-col justify-center items-start gap-1 rounded-t-2xl p-5">
          <div className="flex items-center gap-2 w-full">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-white">
                {prayCard?.group?.name || "내 기도카드"}
              </p>
            </div>
          </div>
          <p className="text-sm text-white w-full text-left">
            시작일 : {createdDateYMD.year}.{createdDateYMD.month}.
            {createdDateYMD.day}
          </p>
        </div>

        <div className="flex flex-col flex-grow relative">
          <Textarea
            className="flex-grow w-full p-4  rounded-2xl overflow-y-auto no-scrollbar border-none focus:outline-gray-200 text-black"
            ref={textareaRef}
            value={prayCard?.content || ""}
            readOnly
            placeholder={`기도카드를 작성해 보아요 ✏️\n내용은 작성 후에도 수정할 수 있어요 :)\n\n1. PrayU와 함께 기도할 수 있기를\n2. `}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col px-10 gap-2 h-70vh">
      <div className="flex justify-end px-2"></div>
      {MyPrayCardBody}
      <div
        className="flex justify-center focus:outline-none gap-2 mt-4"
        onClick={() => onClickPrayerList()}
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
              {prayCard!.pray.filter((pray) => pray.pray_type === type).length}
            </div>
          </div>
        ))}
        <div className="bg-white rounded-lg flex justify-center items-center p-1">
          <img className="w-5" src={iconUserMono} alt="user-icon" />
        </div>
      </div>
    </div>
  );
};

export default PrayCardHistoryUI;
