import { useState, useEffect } from "react";
import { ThanksCardCarouselProps } from "./types";
import { ThanksCardItem } from "./ThanksCardItem";

/**
 * 감사 카드들을 캐러셀 형태로 표시하는 반응형 컴포넌트
 * - 모바일: 1개씩 표시
 * - 태블릿: 2개씩 표시
 * - 데스크톱: 3개씩 표시
 */
export const ThanksCardCarousel = ({
  cards,
  currentIndex,
  onIndexChange,
}: ThanksCardCarouselProps) => {
  const [visibleCards, setVisibleCards] = useState(3);

  // 반응형 카드 개수 계산 (화면이 넓어질수록 더 많은 카드 표시)
  const getVisibleCards = () => {
    if (typeof window === "undefined") return 3; // SSR 대응
    const width = window.innerWidth;
    if (width < 640) return 1; // 모바일
    if (width < 1024) return 2; // 태블릿
    if (width < 1440) return 3; // 일반 데스크톱
    if (width < 1920) return 4; // 대형 데스크톱
    return 5; // 초대형 화면 (4K 등)
  };

  // 화면 크기 변경 감지
  useEffect(() => {
    const updateVisibleCards = () => {
      const newVisibleCards = getVisibleCards();
      setVisibleCards(newVisibleCards);

      // 화면 크기 변경 시 인덱스 재조정
      const newMaxIndex = Math.max(0, cards.length - newVisibleCards);
      if (currentIndex > newMaxIndex) {
        onIndexChange(newMaxIndex);
      }
    };

    // 초기 설정
    updateVisibleCards();

    // 리사이즈 이벤트 등록
    window.addEventListener("resize", updateVisibleCards);
    return () => window.removeEventListener("resize", updateVisibleCards);
  }, [cards.length, currentIndex, onIndexChange]);

  // 자동 슬라이드 효과 (화면별로 올바른 인덱스 계산)
  useEffect(() => {
    const maxIndex = Math.max(0, cards.length - visibleCards);

    if (maxIndex === 0) return; // 슬라이드할 카드가 없으면 종료

    const slideTimer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % (maxIndex + 1);
      onIndexChange(nextIndex);
    }, 10000); // 10초마다 슬라이드

    return () => clearInterval(slideTimer);
  }, [cards.length, visibleCards, currentIndex, onIndexChange]);

  const maxIndex = Math.max(0, cards.length - visibleCards);

  // 간단한 계산
  const cardWidth = 100 / visibleCards; // 각 카드가 차지할 너비 (%)
  const translateX = currentIndex * cardWidth; // 이동할 거리 (%)

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* 캐러셀 컨테이너 */}
      <div className="overflow-x-hidden overflow-y-visible pb-8">
        <div
          className="flex transition-transform duration-[2000ms] ease-in-out"
          style={{
            transform: `translateX(-${translateX}%)`,
          }}
        >
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex-shrink-0 px-2 sm:px-3 lg:px-4"
              style={{ width: `${cardWidth}%` }}
            >
              <ThanksCardItem card={card} />
            </div>
          ))}
        </div>
      </div>

      {/* 진행 표시자 - 모바일에서는 더 작게 */}
      <div className="flex justify-center lg:mt-12 gap-2 sm:gap-3 lg:gap-4">
        {Array.from({ length: Math.max(1, maxIndex + 1) }).map((_, index) => (
          <button
            key={index}
            onClick={() => onIndexChange(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-500 ${
              index === currentIndex
                ? "bg-blue-400 scale-125"
                : "bg-slate-300 hover:bg-slate-400"
            }`}
            aria-label={`${index + 1}번째 카드 그룹으로 이동`}
          />
        ))}
      </div>
    </main>
  );
};
