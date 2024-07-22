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

  const getEmoji = (prayType: PrayType) => {
    if (prayType === "pray") return { emoji: "🙏", text: "기도해요" };
    if (prayType === "good") return { emoji: "👍", text: "힘내세요" };
    if (prayType === "like") return { emoji: "❤️", text: "응원해요" };
    return { emoji: "", text: "" };
  };

  const handleClick = (prayType: PrayType) => () => {
    createPray(prayCard?.id, currentUserId, prayType);
    if (!isPrayToday) setIsPrayToday(true);
  };

  return (
    <div className="flex justify-center space-x-8">
      {Object.values(PrayType).map((type) => {
        const { emoji, text } = getEmoji(type as PrayType);
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
            <div className="text-2xl">{emoji}</div>
            <div className="text-sm">{text}</div>
          </button>
        );
      })}
    </div>
  );
};

export default ReactionBtn;
