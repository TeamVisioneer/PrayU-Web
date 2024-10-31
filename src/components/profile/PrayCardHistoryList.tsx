import useBaseStore from "@/stores/baseStore";
import { PrayCardWithProfiles } from "supabase/types/tables";
import { analyticsTrack } from "@/analytics/analytics";
import { formatDate } from "@/lib/utils";
import { ClipLoader } from "react-spinners";

const PrayCardHistoryList = () => {
  const historyPrayCardList = useBaseStore(
    (state) => state.historyPrayCardList
  );
  const setIsOpenHistoryDrawer = useBaseStore(
    (state) => state.setIsOpenHistoryDrawer
  );
  const setHistoryCard = useBaseStore((state) => state.setHistoryCard);

  const onClickStory = (prayCard: PrayCardWithProfiles) => {
    setHistoryCard(prayCard);
    setIsOpenHistoryDrawer(true);
    analyticsTrack("클릭_기도카드_히스토리", {});
  };

  if (!historyPrayCardList)
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={20} color={"#70AAFF"} loading={true} />
      </div>
    );

  return (
    <div className="w-full grid grid-cols-3 gap-1 p-4 pb-10">
      {historyPrayCardList.map((prayCard, index) => (
        <div
          key={index}
          className="aspect-[3/4] border items-center flex flex-col rounded-lg "
          onClick={() => onClickStory(prayCard)}
        >
          <div className="w-full flex flex-col bg-gradient-to-r from-start via-middle via-52% to-end p-2 rounded-t-lg">
            <p className="text-xs text-white w-full text-left">
              {formatDate(prayCard.created_at)}
            </p>
          </div>
          <div className="w-full flex-grow flex flex-col bg-white p-1 rounded-b-lg">
            <span className="text-xs text-gray-400 line-clamp-3">
              {prayCard.content}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrayCardHistoryList;
