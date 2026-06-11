import { BibleCard as BibleCardType } from "supabase/types/tables";
import { cn } from "@/lib/utils";
import { toBibleCardContent } from "@/constants/bibleCard";
import { ScaledBibleCard } from "./BibleCardBase";

interface BibleCardThumbnailProps {
  bibleCard: BibleCardType | null | undefined;
  className?: string;
  dimmed?: boolean;
  label?: string;
}

const BibleCardThumbnail: React.FC<BibleCardThumbnailProps> = ({
  bibleCard,
  className,
  dimmed = false,
  label,
}) => {
  if (!bibleCard) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-white text-center text-[10px] font-semibold text-gray-400",
          className,
        )}
      >
        말씀카드 없음
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full", className)}>
      <ScaledBibleCard content={toBibleCardContent(bibleCard)} />

      {dimmed && <div className="absolute inset-0 bg-white/65" />}
      {label && (
        <div className="absolute right-2 top-2 rounded-full bg-white px-2 py-0.5 text-[9px] font-semibold text-blue-500 shadow-sm">
          {label}
        </div>
      )}
    </div>
  );
};

export default BibleCardThumbnail;
