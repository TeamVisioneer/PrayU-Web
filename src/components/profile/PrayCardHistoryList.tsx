import useBaseStore from "@/stores/baseStore";
import { PrayCardWithProfiles } from "supabase/types/tables";
import { analyticsTrack } from "@/analytics/analytics";
import { formatDate } from "@/lib/utils";
import { ClipLoader } from "react-spinners";
import { useState } from "react";
import { useEffect } from "react";
import useAuth from "@/hooks/useAuth";

const PrayCardHistoryList = () => {
  const { user } = useAuth();
  const historyPrayCardList = useBaseStore(
    (state) => state.historyPrayCardList
  );
  const setHistoryPrayCardList = useBaseStore(
    (state) => state.setHistoryPrayCardList
  );
  const setIsOpenHistoryDrawer = useBaseStore(
    (state) => state.setIsOpenHistoryDrawer
  );
  const setHistoryCard = useBaseStore((state) => state.setHistoryCard); // 클릭돼서 열릴 카드
  const fetchUserPrayCardList = useBaseStore(
    (state) => state.fetchUserPrayCardList
  );

  const historyPrayCardListView = useBaseStore(
    (state) => state.historyPrayCardListView
  );
  const setHistoryPrayCardListView = useBaseStore(
    (state) => state.setHistoryPrayCardListView
  );
  const historyPrayCardCount = useBaseStore(
    (state) => state.historyPrayCardCount
  );

  const pageSize = 3;
  const [offset, setOffset] = useState(pageSize);

  useEffect(() => {
    if (historyPrayCardList && historyPrayCardListView.length == 0)
      setHistoryPrayCardListView([...historyPrayCardList]);
  }, [
    historyPrayCardList,
    historyPrayCardListView,
    setHistoryPrayCardListView,
  ]);

  if (!historyPrayCardCount) return;

  const onClickMoreHistoryPrayCardList = async () => {
    console.log("offset", offset);
    console.log("historyPrayCardCount", historyPrayCardCount);
    if (offset >= historyPrayCardCount) return;

    setHistoryPrayCardList(null);
    const limit =
      offset > historyPrayCardCount ? historyPrayCardCount - offset : pageSize;
    const newHistoryPrayCardList = await fetchUserPrayCardList(
      user!.id,
      limit,
      offset
    );
    console.log("newHistoryPrayCardList", newHistoryPrayCardList);
    if (!historyPrayCardList || !newHistoryPrayCardList) return;

    setHistoryPrayCardListView([
      ...historyPrayCardList,
      ...newHistoryPrayCardList,
    ]);
    setOffset(offset + pageSize);
    console.log("length", historyPrayCardListView.length);
  };

  const onClickStory = (prayCard: PrayCardWithProfiles) => {
    setHistoryCard(prayCard);
    setIsOpenHistoryDrawer(true);
    analyticsTrack("클릭_기도카드_히스토리", {});
  };

  // console.log("historyPrayCardList", historyPrayCardList);

  if (!historyPrayCardList)
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={20} color={"#70AAFF"} loading={true} />
      </div>
    );

  return (
    <div className="w-full grid grid-cols-3 gap-3 p-1 pb-10">
      {historyPrayCardListView.map((prayCard, index) => (
        <div
          key={index}
          className="aspect-[0.76] border-none items-center flex flex-col rounded-lg "
          onClick={() => onClickStory(prayCard)}
        >
          <div className="w-full flex flex-col bg-[#BBBFE6] p-2 rounded-t-xl  ">
            <p className="text-xs text-white w-full text-left">
              {formatDate(prayCard.created_at)}
            </p>
          </div>
          <div className="w-full flex-grow flex flex-col bg-white p-2 rounded-b-xl">
            <span className="text-[0.7rem] text-gray-400 line-clamp-3">
              {prayCard.content}
            </span>
          </div>
        </div>
      ))}
      {offset < historyPrayCardCount && (
        <div
          onClick={() => onClickMoreHistoryPrayCardList()}
          className="w-full flex justify-center items-center"
        >
          {historyPrayCardList ? (
            <span className="text-gray-500 underline ">더보기</span>
          ) : (
            <ClipLoader color="#70AAFF" size={10} />
          )}
        </div>
      )}
    </div>
  );
};

export default PrayCardHistoryList;
