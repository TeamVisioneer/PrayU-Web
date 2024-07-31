import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
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
  const isPrayToday = useBaseStore((state) => state.isPrayToday);
  const prayCardCarouselApi = useBaseStore(
    (state) => state.prayCardCarouselApi
  );
  const setIsOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setIsOpenTodayPrayDrawer
  );

  const createPray = useBaseStore((state) => state.createPray);
  const setIsPrayToday = useBaseStore((state) => state.setIsPrayToday);

  const hasPrayed = Boolean(todayPrayTypeHash[prayCard?.id || ""]);

  const handleClick = (prayType: PrayType) => () => {
    createPray(prayCard?.id, currentUserId, prayType);
    if (!isPrayToday) setIsPrayToday(true);
    if (prayCardCarouselApi) {
      sleep(500).then(() => {
        if (
          prayCardCarouselApi.selectedScrollSnap() ==
          prayCardCarouselApi.scrollSnapList().length - 2
        ) {
          setIsOpenTodayPrayDrawer(false);
          return null;
        } else {
          prayCardCarouselApi.scrollNext();
        }
      });
    }
  };

  return (
    <div className="flex justify-center p-2 space-x-8">
      {Object.values(PrayType).map((type) => {
        const emojiData = PrayTypeDatas[type];
        if (!emojiData) return null;

        return (
          <button
            key={type}
            onClick={handleClick(type as PrayType)}
            className={`flex justify-center items-center w-12 h-12 rounded-lg ${
              emojiData.bgColor
            } ${
              !hasPrayed
                ? "opacity-90 shadow-[0_4px_2px_rgb(0,0,0,0.3)]"
                : todayPrayTypeHash[prayCard?.id || ""] == type
                ? "opacity-90 inner-shadow"
                : "opacity-20 shadow-[0_4px_2px_rgb(0,0,0,0.3)]"
            }`}
            disabled={hasPrayed}
          >
            <img src={emojiData.icon} className="w-9 h-9" />
          </button>
        );
      })}
    </div>
  );
};

export default ReactionBtn;
