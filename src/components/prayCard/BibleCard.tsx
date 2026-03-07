import { getISODateYMD } from "@/lib/utils";
import { BibleCard as BibleCardType } from "../../../supabase/types/tables";

interface BibleCardProps {
  bibleCard?: BibleCardType
}

const BibleCard: React.FC<BibleCardProps> = ({ bibleCard }) => {
  // 스켈레톤 처리
  if (!bibleCard) {
    return (
      <div className="rounded-xl overflow-hidden aspect-[3/4] flex flex-col justify-between px-5 sm:px-6 md:px-8 py-4 sm:py-5 bg-[#FEFDFC] border border-gray-200">
        <section>
          {/* 성경 구절 카드 영역 */}
          <div className="w-full aspect-square bg-gray-200 rounded-3xl animate-pulse"></div>
          {/* 제목 및 키워드 영역 */}
          <div className="flex flex-col mt-2 sm:mt-3 gap-2">
            {/* 제목 */}
            <div className="h-6 sm:h-7  bg-gray-200 rounded w-2/3 animate-pulse"></div>
            {/* 키워드 */}
            <div className="h-6 sm:h-7 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
        </section>

        {/* 하단 날짜 및 계정 정보 */}
        <section className="flex justify-between w-full text-xs sm:text-sm">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </section>
      </div>
    );
  }

  const { year, month, day } = getISODateYMD(bibleCard.created_at);
  

  const primary = bibleCard.colors[0];
  const secondary = bibleCard.colors[1];

  const topLeftRadius = bibleCard.radius[0];
  const topRightRadius = bibleCard.radius[1];
  const bottomRightRadius = bibleCard.radius[2];
  const bottomLeftRadius = bibleCard.radius[3];

  return (
    <div className="rounded-xl overflow-hidden aspect-[3/4] flex flex-col justify-between px-5 sm:px-6 md:px-8 py-4 sm:py-5 bg-[#FEFDFC] border border-gray-200">
      <section>
        <div
          className="w-full aspect-square flex flex-col justify-center items-center"
          style={{
            background: `linear-gradient(159deg, ${primary}, ${secondary})`,
            borderTopLeftRadius: topLeftRadius,
            borderTopRightRadius: topRightRadius,
            borderBottomRightRadius: bottomRightRadius,
            borderBottomLeftRadius: bottomLeftRadius,
          }}
        >
          <div className="handwrittenV2 flex flex-col w-full h-full justify-center items-center py-4 sm:py-5 px-8 sm:px-10 md:px-12 gap-4 sm:gap-5 text-white text-center whitespace-pre-wrap">
            <div className="leading-relaxed sm:leading-[35px] tracking-wide text-2xl sm:text-3xl md:text-[30px]">
              {bibleCard.bible_sentence}
            </div>
            <div className="leading-tight text-xl sm:text-2xl md:text-[24px] tracking-wide">
              {bibleCard.bible_reference}
            </div>
          </div>
        </div>

        <div style={{ color: primary }} className="flex flex-col mt-2 sm:mt-3">
          <div className="text-3xl sm:text-4xl md:text-[40px] font-bold">
            {bibleCard.name}
          </div>
          <div className="text-lg sm:text-xl md:text-[20px] flex flex-wrap gap-2 text-black-500">
            {bibleCard.keywords.map((keyword, index) => (
              <span key={index}>#{keyword}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="flex justify-between w-full text-gray-600 text-xs sm:text-sm">
        <span className="tracking-wide">{`${year}.${month}.${day}.`}</span>
        <div>@prayu.official</div>
      </section>
    </div>
  );
};

export default BibleCard;
