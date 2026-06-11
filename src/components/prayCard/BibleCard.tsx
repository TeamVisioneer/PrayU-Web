import { BibleCard as BibleCardType } from "supabase/types/tables";
import { getISODateYMD } from "@/lib/utils";

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

  const { year, month, day } = getISODateYMD(bibleCard.created_at);
  const [primary = "#608CFF", secondary = "#AAC7FF"] = bibleCard.colors;
  const [
    topLeftRadius = "80px",
    topRightRadius = "120px",
    bottomRightRadius = "80px",
    bottomLeftRadius = "120px",
  ] = bibleCard.radius;

  return (
    <div className="relative flex aspect-[3/4] w-full flex-col rounded-xl border border-gray-100 bg-[#FEFDFC] px-5 py-4 text-left shadow-prayCard">
      <div
        className="flex aspect-square w-full flex-col items-center justify-center px-7 py-5 text-center text-white"
        style={{
          background: `linear-gradient(159deg, ${primary}, ${secondary})`,
          borderTopLeftRadius: topLeftRadius,
          borderTopRightRadius: topRightRadius,
          borderBottomRightRadius: bottomRightRadius,
          borderBottomLeftRadius: bottomLeftRadius,
        }}
      >
        <p className="handwrittenV2 whitespace-pre-wrap text-[26px] leading-[34px]">
          {bibleCard.bible_sentence.replace(/<[^>]*>/g, "").trim()}
        </p>
        <p className="handwrittenV2 mt-5 text-[20px] leading-tight">
          {bibleCard.bible_reference}
        </p>
      </div>

      <div className="mt-3 text-left" style={{ color: primary }}>
        <p className="truncate text-[34px] font-bold">{bibleCard.name}</p>
        <div className="flex flex-wrap gap-x-2 text-base text-gray-700">
          {bibleCard.keywords.map((keyword) => (
            <span key={keyword}>#{keyword}</span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-5 right-5 flex justify-between text-xs text-[#666666]">
        <span>{`${year}.${month}.${day}.`}</span>
        <span>@prayu.official</span>
      </div>
    </div>
  );
};

export default BibleCard;
