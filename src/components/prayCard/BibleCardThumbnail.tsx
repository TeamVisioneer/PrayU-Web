import { BibleCard as BibleCardType } from "supabase/types/tables";
import { cn, getISODateYMD } from "@/lib/utils";

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

  const { year, month, day } = getISODateYMD(bibleCard.created_at);
  const [primary = "#608CFF", secondary = "#AAC7FF"] = bibleCard.colors;
  const [
    topLeftRadius = "40px",
    topRightRadius = "60px",
    bottomRightRadius = "40px",
    bottomLeftRadius = "60px",
  ] = bibleCard.radius;

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col bg-[#FEFDFC] p-1 text-left",
        className,
      )}
    >
      <div
        className="flex aspect-square w-full shrink-0 flex-col items-center justify-center gap-1 px-2 py-2 text-center text-white"
        style={{
          background: `linear-gradient(159deg, ${primary}, ${secondary})`,
          borderTopLeftRadius: topLeftRadius,
          borderTopRightRadius: topRightRadius,
          borderBottomRightRadius: bottomRightRadius,
          borderBottomLeftRadius: bottomLeftRadius,
        }}
      >
        <p className="handwrittenV2 line-clamp-4 text-[9px] leading-[13px]">
          {bibleCard.bible_sentence.replace(/<[^>]*>/g, "").trim()}
        </p>
        <p className="handwrittenV2 mt-1 line-clamp-1 text-[7px] leading-tight">
          {bibleCard.bible_reference}
        </p>
      </div>

      <div className="mt-1 min-h-0 flex-1" style={{ color: primary }}>
        <p className="truncate text-[13px] font-bold leading-tight">
          {bibleCard.name}
        </p>
        <div className="mt-0.5 flex flex-wrap gap-x-1 text-[8px] leading-tight text-gray-700">
          {bibleCard.keywords.slice(0, 3).map((keyword) => (
            <span key={keyword}>#{keyword}</span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-1 text-[7px] leading-none text-gray-400">
        <span>{`${year}.${month}.${day}.`}</span>
        <span className="truncate">@prayu.official</span>
      </div>

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
