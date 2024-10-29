import useBaseStore from "@/stores/baseStore";
import { Badge } from "../ui/badge";
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
    <div className="flex flex-full w-full items-center">
      <div className="grid grid-cols-3 gap-x-4 gap-y-2">
        {historyPrayCardList.map((prayCard, index) => (
          <div
            key={index}
            className="w-28 h-40 border rounded-2xl shadow-prayCard bg-gradient-to-t from-[#FFF8F8] via-[#FFEBFA] via-41.75% to-[#AAC7FF] items-center justify-center flex flex-col"
            onClick={() => {
              onClickStory(prayCard);
            }}
          >
            <Badge className="mb-4 text-xs">{prayCard.group!.name}</Badge>
            <span className="text-center text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis w-full block">
              {formatDate(prayCard.created_at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrayCardHistoryList;
