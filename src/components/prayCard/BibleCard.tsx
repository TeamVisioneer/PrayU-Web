import { BibleCard as BibleCardType } from "supabase/types/tables";
import { toBibleCardContent } from "@/constants/bibleCard";
import { ScaledBibleCard } from "./BibleCardBase";

interface BibleCardProps {
  bibleCard: BibleCardType | null | undefined;
}

const BibleCard: React.FC<BibleCardProps> = ({ bibleCard }) => {
  if (!bibleCard) {
    return (
      <div className="flex aspect-[3/4] w-full items-center justify-center rounded-xl border border-gray-100 bg-white text-sm text-gray-400 shadow-prayCard">
        말씀카드가 아직 없어요
      </div>
    );
  }

  return (
    <ScaledBibleCard
      content={toBibleCardContent(bibleCard)}
      className="rounded-xl shadow-prayCard"
    />
  );
};

export default BibleCard;
