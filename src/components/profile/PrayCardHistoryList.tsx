import useBaseStore from "@/stores/baseStore";
import { PrayCardWithProfiles } from "supabase/types/tables";
import { analyticsTrack } from "@/analytics/analytics";
import { formatDate } from "@/lib/utils";
import { ClipLoader } from "react-spinners";
import { useState } from "react";
import { useEffect } from "react";
import Vector from "@/assets/Vector.png";

const PrayCardHistoryList = () => {
  const user = useBaseStore((state) => state.user);
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

  const pageSize = 18;
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
    if (offset >= historyPrayCardCount) return;

    setHistoryPrayCardList(null);
    const limit =
      offset > historyPrayCardCount ? historyPrayCardCount - offset : pageSize;
    const newHistoryPrayCardList = await fetchUserPrayCardList(
      user!.id,
      limit,
      offset
    );
    if (!historyPrayCardList || !newHistoryPrayCardList) return;
    setHistoryPrayCardListView([
      ...historyPrayCardListView,
      ...newHistoryPrayCardList,
    ]);
    setOffset(offset + pageSize);
  };

  const onClickStory = (prayCard: PrayCardWithProfiles) => {
    setHistoryCard(prayCard);
    setIsOpenHistoryDrawer(true);
    analyticsTrack("클릭_기도카드_히스토리", {});
  };

  return (
    <div className="flex flex-col gap-1 pb-10 items-center">
      <div className="w-full grid grid-cols-3 gap-3 p-1 pb-5">
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
      </div>
      {offset < historyPrayCardCount && (
        <div
          onClick={() => onClickMoreHistoryPrayCardList()}
          className="w-fit flex flex-grow justify-center items-center bg-[#DEDFF1] rounded-xl pt-1 pb-1 px-4"
        >
          {historyPrayCardList ? (
            <div className="flex flex-row">
              <span className="font-semibold text-sm">더보기</span>
              <div className="flex flex-col flex-grow items-center justify-center h-auto">
                <img
                  className="h-[0.3rem] w-auto ml-2"
                  src={Vector}
                  alt="Not Prayed"
                />
              </div>
            </div>
          ) : (
            <ClipLoader color="#70AAFF" size={10} />
          )}
        </div>
      )}
    </div>
  );
};

export default PrayCardHistoryList;
