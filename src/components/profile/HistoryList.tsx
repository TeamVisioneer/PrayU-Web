import useBaseStore from "@/stores/baseStore";
import { PrayCardWithProfiles } from "supabase/types/tables";

const HistoryList = () => {
  const userPrayCardListAll = useBaseStore(
    (state) => state.userPrayCardListAll
  );

  const setIsOpenHistoryDrawer = useBaseStore(
    (state) => state.setIsOpenHistoryDrawer
  );

  const setHistoryCard = useBaseStore((state) => state.setHistoryCard);

  //   const onClickStory = (index) => {
  //     //analyticsTrack("클릭_로그아웃", {});
  //     //setIsOpenStoryDrawer(true)
  //   };

  const onClickStory = (prayCard: PrayCardWithProfiles) => {
    setHistoryCard(prayCard);
    setIsOpenHistoryDrawer(true);
  };

  console.log("userPrayCardListAll", userPrayCardListAll);

  return (
    <div className="flex flex-full w-full items-center">
      <div className="grid grid-cols-3 gap-x-4 gap-y-2">
        {userPrayCardListAll!.map((prayCard, index) => (
          <div
            key={index}
            className="w-28 h-40 border rounded-2xl shadow-prayCard bg-gradient-to-t from-[#FFF8F8] via-[#FFEBFA] via-41.75% to-[#AAC7FF] items-center justify-center flex flex-col"
            onClick={() => {
              onClickStory(prayCard);
            }}
          >
            <span className="text-left text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis w-full block">
              {prayCard.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
