import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";

const HistoryList = () => {
  const userPrayCardListAll = useBaseStore(
    (state) => state.userPrayCardListAll
  );

  //   const onClickStory = (index) => {
  //     //analyticsTrack("클릭_로그아웃", {});
  //     //setIsOpenStoryDrawer(true)
  //   };

  const onClickStory = (card) => {
    console.log("onClickStory", card.content);
  };

  console.log("userPrayCardListAll", userPrayCardListAll);

  return (
    <div className="flex flex-full w-full items-center">
      <div className="grid grid-cols-3 gap-x-4 gap-y-2">
        {userPrayCardListAll!.map((card, index) => (
          <div
            key={index}
            className="w-28 h-40 border rounded-2xl shadow-prayCard bg-gradient-to-t from-[#FFF8F8] via-[#FFEBFA] via-41.75% to-[#AAC7FF]"
            onClick={() => {
              onClickStory(card);
            }}
          >
            그룹
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
