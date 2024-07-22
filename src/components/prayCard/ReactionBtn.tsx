import { PrayType } from "@/Enums/prayType";
import { PrayCardWithProfiles } from "supabase/types/tables";
import useBaseStore from "@/stores/baseStore";

interface ReactionBtnProps {
  currentUserId: string | undefined;
  prayCard: PrayCardWithProfiles | undefined;
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

  const handleClick = (prayType: PrayType) => () => {
    createPray(prayCard?.id, currentUserId, prayType);
    if (!isPrayToday) setIsPrayToday(true);
  };

  return (
    <div className="flex justify-center space-x-8">
      {Object.values(PrayType).map((type) => {
        const emojiData = reactionDatas[type];
        if (!emojiData) return null;

        return (
          <button
            key={type}
            onClick={handleClick(type as PrayType)}
            className={`w-[90px] py-2 px-2 flex flex-col items-center rounded-2xl ${
              todayPrayTypeHash[prayCard?.id || ""] === type
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-purple-100 text-black"
            }`}
            disabled={Boolean(todayPrayTypeHash[prayCard?.id || ""])}
          >
            <div className="text-2xl">{emojiData.emoji}</div>
            <div className="text-sm">{emojiData.text}</div>
          </button>
        );
      })}
    </div>
  );
};

export default ReactionBtn;
