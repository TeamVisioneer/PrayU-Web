import useBaseStore from "@/stores/baseStore";
import { PrayCardWithProfiles } from "supabase/types/tables";
import { analyticsTrack } from "@/analytics/analytics";
import { useState } from "react";
import ShowMoreBtn from "../common/ShowMoreBtn";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import BibleCardThumbnail from "../prayCard/BibleCardThumbnail";

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
          // 말씀카드는 bible_card row 데이터로 렌더한다 (#448 통합 렌더러).
          // image_key/image_url 은 공유 산출물 — 목록 UI 가 의존하지 않는다
          if (prayCard.bible_card) {
            return (
              <div
                key={index}
                className="aspect-[3/4] cursor-pointer overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md"
                onClick={() => onClickStory(prayCard)}
              >
                <BibleCardThumbnail bibleCard={prayCard.bible_card} />
              </div>
            );
          }

          // 레거시 표시 호환: 신규 체계 이전 카드는 bible_card row 없이 URL 만 있다
          if (prayCard.bible_card_url) {
            return (
              <div
                key={index}
                className="aspect-[3/4] cursor-pointer overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md"
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
          // 받은 기도 요약: 같은 심볼을 개수만큼 겹치지 않고, 종류별 심볼 + 총 개수로.
          // 많은 순으로 정렬해 가장 많이 받은 반응이 앞에 온다
          const prayCountByType = new Map<string, number>();
          prayCard.pray.forEach((pray) =>
            prayCountByType.set(
              pray.pray_type ?? "",
              (prayCountByType.get(pray.pray_type ?? "") ?? 0) + 1
            )
          );
          const prayTypes = [...prayCountByType.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([type]) => type as PrayType);

          return (
            <div
              key={index}
              className="aspect-[3/4] grid cursor-pointer grid-rows-[auto_1fr_auto] gap-1 overflow-hidden rounded-xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
              onClick={() => onClickStory(prayCard)}
            >
              <p className="truncate text-xs font-bold text-accentTo">
                {prayCard.group?.name || "말씀 카드"}
              </p>
              {/* line-clamp 는 grid stretch 로 늘어나면 말줄임 뒤 줄이 계속 그려진다 —
                  min-h-0 + overflow-hidden 래퍼로 본문이 아래 행을 침범하지 않게 한다 */}
              <div className="min-h-0 overflow-hidden">
                <p className="line-clamp-3 text-xs leading-relaxed text-gray-700">
                  {prayCard.content}
                </p>
              </div>
              {prayCard.pray.length > 0 && (
                <div className="flex items-center gap-1 pt-1">
                  <div className="flex -space-x-1.5">
                    {prayTypes.map((type) => (
                      <img
                        key={type}
                        src={PrayTypeDatas[type]?.img}
                        className="h-5 w-5 rounded-full border-2 border-white object-cover"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-gray-500">
                    {prayCard.pray.length}
                  </span>
                </div>
              )}
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
