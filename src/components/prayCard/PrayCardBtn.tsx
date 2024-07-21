import { PrayType } from "@/Enums/prayType";
import { PrayCardWithProfiles } from "supabase/types/tables";
import useBaseStore from "@/stores/baseStore";

interface PrayCardBtnProps {
  currentUserId: string | undefined;
  prayCard: PrayCardWithProfiles | undefined;
}

const PrayCardBtn: React.FC<PrayCardBtnProps> = ({
  currentUserId,
  prayCard,
}) => {
  const todayPrayType = useBaseStore((state) => state.todayPrayType);
  const createPray = useBaseStore((state) => state.createPray);

  const getEmoji = (prayType: PrayType) => {
    if (prayType === "pray") return { emoji: "🙏", text: "기도해요" };
    if (prayType === "good") return { emoji: "👍", text: "힘내세요" };
    if (prayType === "like") return { emoji: "❤️", text: "응원해요" };
    return { emoji: "", text: "" };
  };

  return (
    <div className="flex justify-center space-x-8">
      {Object.values(PrayType).map((type) => {
        const { emoji, text } = getEmoji(type as PrayType);
        return (
          <button
            key={type}
            onClick={() =>
              createPray(prayCard?.id, currentUserId, type as PrayType)
            }
            className={`w-[90px] py-2 px-2 flex flex-col items-center rounded-2xl ${
              todayPrayType === type
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-purple-100 text-black"
            }`}
            disabled={Boolean(todayPrayType)}
          >
            <div className="text-2xl">{emoji}</div>
            <div className="text-sm">{text}</div>
          </button>
        );
      })}
    </div>
  );
};

export default PrayCardBtn;
