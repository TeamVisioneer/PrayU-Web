import { useState } from "react";
import { PrayCardWithProfiles } from "supabase/types/tables";
import { analyticsTrack } from "@/analytics/analytics";
import PrayCard from "./PrayCard";
import BibleCard from "./BibleCard";

interface PrayCardWithBibleCardProps {
  prayCard: PrayCardWithProfiles | undefined;
  initialFlipped?: boolean;
  // 부모가 현재 보이는 면에 따라 하단 액션을 바꿀 수 있도록 플립 상태를 알림
  onFlipChange?: (isFlipped: boolean) => void;
}

const PrayCardWithBibleCard: React.FC<PrayCardWithBibleCardProps> = ({
  prayCard,
  initialFlipped = false,
  onFlipChange,
}) => {
  const [isFlipped, setIsFlipped] = useState(initialFlipped);
  const bibleCard = prayCard?.bible_card;

  const handleFlip = () => {
    if (!bibleCard) return;
    analyticsTrack("클릭_카드_뒤집기", {
      from: isFlipped ? "BibleCard" : "PrayCard",
      to: isFlipped ? "PrayCard" : "BibleCard",
    });
    const next = !isFlipped;
    setIsFlipped(next);
    onFlipChange?.(next);
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleFlip}
        className="w-full perspective-1000 text-left"
        disabled={!bibleCard}
      >
        <div
          className={`relative aspect-[3/4] w-full transition-transform duration-700 transform-style-preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          <div className="absolute inset-0 backface-hidden">
            <PrayCard prayCard={prayCard} isMoreBtn={false} editable={false} />
          </div>
          <div className="absolute inset-0 rotate-y-180 backface-hidden">
            <BibleCard bibleCard={bibleCard} />
          </div>
        </div>
      </button>
      {bibleCard && (
        <button
          type="button"
          onClick={handleFlip}
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-sm"
        >
          {isFlipped ? "기도카드 보기" : "말씀카드 보기"}
        </button>
      )}
    </div>
  );
};

export default PrayCardWithBibleCard;
