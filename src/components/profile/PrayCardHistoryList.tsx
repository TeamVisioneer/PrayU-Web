import useBaseStore from "@/stores/baseStore";
import { PrayCardWithProfiles } from "supabase/types/tables";
import { analyticsTrack } from "@/analytics/analytics";
import { useState } from "react";
import ShowMoreBtn from "../common/ShowMoreBtn";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";

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

  if (!historyPrayCardCount) return null;

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
    analyticsTrack("클릭_기도카드_히스토리", {});
  };

  const onClickStory = (prayCard: PrayCardWithProfiles) => {
    setHistoryCard(prayCard);
    setIsOpenHistoryDrawer(true);
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="grid w-full grid-cols-3 gap-3">
        {historyPrayCardListView.map((prayCard, index) => {
          if (prayCard.bible_card_url) {
            return (
              <div
                key={index}
                className="aspect-[0.76] cursor-pointer overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md"
                onClick={() => onClickStory(prayCard)}
              >
                <img
                  src={prayCard.bible_card_url}
                  alt="Bible Card"
                  className="h-full w-full object-cover"
                />
              </div>
            );
          }
          return (
            <div
              key={index}
              className="aspect-[0.76] flex cursor-pointer flex-col gap-1.5 rounded-xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
              onClick={() => onClickStory(prayCard)}
            >
              <p className="truncate text-xs font-bold text-indigo-600">
                {prayCard.group?.name || "말씀 카드"}
              </p>
              <p className="line-clamp-5 flex-grow text-xs leading-relaxed text-gray-700">
                {prayCard.content}
              </p>
              <div className="flex items-center space-x-1 pt-1">
                <div className="flex -space-x-2">
                  {prayCard.pray.slice(0, 5).map((pray) => (
                    <img
                      key={pray.id}
                      src={PrayTypeDatas[pray.pray_type as PrayType]?.img}
                      className="h-5 w-5 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
                {prayCard.pray.length > 5 && (
                  <span className="text-xs text-gray-500">
                    +{prayCard.pray.length - 5}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {offset < historyPrayCardCount && (
        <ShowMoreBtn
          isLoading={!historyPrayCardList}
          onClick={onClickMoreHistoryPrayCardList}
        />
      )}
    </div>
  );
};

export default PrayCardHistoryList;
