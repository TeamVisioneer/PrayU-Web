import { PrayType } from "@/Enums/prayType";
import { PrayCardWithProfiles } from "supabase/types/tables";
import useBaseStore from "@/stores/baseStore";
import { sleep } from "@/lib/utils";

interface ReactionBtnProps {
  currentUserId: string;
  prayCard: PrayCardWithProfiles | null;
}

const ReactionBtn: React.FC<ReactionBtnProps> = ({
  currentUserId,
  prayCard,
}) => {
  const todayPrayTypeHash = useBaseStore((state) => state.todayPrayTypeHash);
  const createPray = useBaseStore((state) => state.createPray);
  const isPrayToday = useBaseStore((state) => state.isPrayToday);
  const setIsPrayToday = useBaseStore((state) => state.setIsPrayToday);
  const reactionDatas = useBaseStore((state) => state.reactionDatas);
  const prayCardCarouselApi = useBaseStore(
    (state) => state.prayCardCarouselApi
  );
  const setOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setOpenTodayPrayDrawer
  );

  const handleClick = (prayType: PrayType) => () => {
    createPray(prayCard?.id, currentUserId, prayType);
    if (!isPrayToday) setIsPrayToday(true);
    window.navigator.vibrate(200);
    if (prayCardCarouselApi) {
      sleep(500).then(() => {
        if (
          prayCardCarouselApi.selectedScrollSnap() ==
          prayCardCarouselApi.scrollSnapList().length - 2
        ) {
          setOpenTodayPrayDrawer(false);
          return null;
        } else {
          prayCardCarouselApi.scrollNext();
        }
      });
    }
  };

  const hasPrayed = Boolean(todayPrayTypeHash[prayCard?.id || ""]);

  return (
    <div className="flex justify-center space-x-8">
      {Object.values(PrayType).map((type) => {
        const emojiData = reactionDatas[type];
        if (!emojiData) return null;

        return (
          <button
            key={type}
            onClick={handleClick(type as PrayType)}
            className={`w-12 h-12 flex flex-col items-center rounded-2xl drop-shadow-[0_4px_2px_rgb(0,0,0,0.3)] ${
              hasPrayed && todayPrayTypeHash[prayCard?.id || ""] !== type
                ? "opacity-20"
                : "opacity-90"
            }`}
            disabled={hasPrayed}
          >
            <img src={emojiData.reactImg} className="w-12 h-12" />
          </button>
        );
      })}
    </div>
  );
};

export default ReactionBtn;
