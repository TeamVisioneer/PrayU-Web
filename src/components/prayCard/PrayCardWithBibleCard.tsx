import React, { useState } from "react";
import { Bible, PrayCardWithProfiles } from "supabase/types/tables";
import PrayCard from "./PrayCard";
import BibleCard from "./BibleCard";
import { RefreshCw } from "lucide-react";
import { analyticsTrack } from "@/analytics/analytics";

/**
 * 양면 카드 컴포넌트 - 기도카드와 말씀카드를 3D 플립 애니메이션으로 전환
 *
 * @component
 * @description
 * PrayCard와 BibleCard를 양면으로 가진 카드 UI입니다.
 * 사용자가 버튼을 클릭하면 3D 플립 애니메이션(Y축 180도 회전)으로 카드가 전환됩니다.
 *
 * @example
 * ```tsx
 * <PrayCardWithBibleCard
 *   prayCard={myPrayCard}
 *   bibleCardData={{ name: "홍길동", keywords: ["믿음", "소망", "사랑"] }}
 *   isMoreBtn={true}
 *   editable={false}
 * />
 * ```
 *
 * @param {PrayCardWithProfiles} prayCard - 기도카드 데이터
 * @param {Object} bibleCardData - 말씀카드 데이터
 * @param {string} bibleCardData.name - 말씀카드에 표시될 이름
 * @param {string[]} bibleCardData.keywords - 말씀카드에 표시될 키워드 배열
 */
interface PrayCardWithBibleCardProps {
  prayCard?: PrayCardWithProfiles;
  bibleCard?: {
    name: string;
    keywords: string[];
    bible: Bible;
    colors: string[];
    radius: string[];
    createdAt: string;
  };
}

const PrayCardWithBibleCard: React.FC<PrayCardWithBibleCardProps> = ({
  prayCard,
  bibleCard,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
    analyticsTrack("클릭_카드_뒤집기", {
      from: isFlipped ? "BibleCard" : "PrayCard",
      to: isFlipped ? "PrayCard" : "BibleCard",
    });
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 카드 컨테이너 */}
      <div className="w-full aspect-[3/4] perspective-1000">
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* 앞면: PrayCard */}
          <div className="absolute w-full h-full backface-hidden">
            <BibleCard bibleCard={bibleCard} />
          </div>

          {/* 뒷면: BibleCard */}
          <div className="absolute w-full h-full rotate-y-180 backface-hidden">
            <PrayCard prayCard={prayCard} />
          </div>
        </div>
      </div>

      {/* 뒤집기 버튼 */}
      <div className="flex justify-center">
        <button
          onClick={handleFlip}
          className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-mainBtn transition-all duration-300"
        >
          <RefreshCw
            className="w-4 h-4 text-gray-600 group-hover:text-mainBtn group-hover:rotate-180 transition-all duration-500"
            strokeWidth={2.5}
          />
          <span className="text-sm font-medium text-gray-700 group-hover:text-mainBtn transition-colors">
            {isFlipped ? "기도카드" : "말씀카드"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default PrayCardWithBibleCard;
