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
  const [autoSlideEnabled, setAutoSlideEnabled] = useState(false);

  // 스와이프 상태 관리
  const [isSwipping, setIsSwipping] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);

  // 초기 인덱스 설정이 완료되면 자동 슬라이드 활성화
  useEffect(() => {
    const totalPages = Math.ceil(cards.length / visibleCards);
    const maxIndex = Math.max(0, totalPages - 1);

    // 카드가 충분하고 (페이지가 2개 이상) 유효한 인덱스가 설정되면 활성화
    if (totalPages > 1 && currentIndex >= 0 && currentIndex <= maxIndex) {
      setAutoSlideEnabled(true);
    } else {
      setAutoSlideEnabled(false);
    }
  }, [cards.length, visibleCards, currentIndex]);

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

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(cards.length / visibleCards);
  const maxIndex = Math.max(0, totalPages - 1);

  // 스와이프 핸들러들
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartX(touch.clientX);
    setCurrentX(touch.clientX);
    setIsSwipping(true);
    setSwipeOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipping) return;
    const touch = e.touches[0];
    setCurrentX(touch.clientX);
    const offset = touch.clientX - startX;
    setSwipeOffset(offset);
  };

  const handleTouchEnd = () => {
    if (!isSwipping) return;

    const swipeDistance = currentX - startX;
    const minSwipeDistance = 50; // 최소 50px 스와이프

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // 오른쪽으로 스와이프: 왼쪽(오래된) 방향으로 이동 (일반적인 캐러셀 동작)
        const nextIndex = currentIndex - 1 < 0 ? maxIndex : currentIndex - 1;
        onIndexChange(nextIndex);
      } else {
        // 왼쪽으로 스와이프: 오른쪽(최신) 방향으로 이동 (일반적인 캐러셀 동작)
        const nextIndex = currentIndex + 1 > maxIndex ? 0 : currentIndex + 1;
        onIndexChange(nextIndex);
      }
    }

    // 스와이프 상태 초기화
    setIsSwipping(false);
    setSwipeOffset(0);
  };

  // 마우스 드래그 지원
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setCurrentX(e.clientX);
    setIsSwipping(true);
    setSwipeOffset(0);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSwipping) return;
    setCurrentX(e.clientX);
    const offset = e.clientX - startX;
    setSwipeOffset(offset);
  };

  const handleMouseUp = () => {
    if (!isSwipping) return;

    const swipeDistance = currentX - startX;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // 오른쪽으로 드래그: 왼쪽(오래된) 방향으로 이동
        const nextIndex = currentIndex - 1 < 0 ? maxIndex : currentIndex - 1;
        onIndexChange(nextIndex);
      } else {
        // 왼쪽으로 드래그: 오른쪽(최신) 방향으로 이동
        const nextIndex = currentIndex + 1 > maxIndex ? 0 : currentIndex + 1;
        onIndexChange(nextIndex);
      }
    }

    setIsSwipping(false);
    setSwipeOffset(0);
  };

  // 자동 슬라이드 효과 (오른쪽에서 왼쪽으로: 최신 → 오래된)
  useEffect(() => {
    // 스와이프 중이거나 자동 슬라이드가 비활성화되면 타이머 정지
    if (!autoSlideEnabled || isSwipping) {
      return;
    }

    const slideTimer = setInterval(() => {
      // 오른쪽(최신) → 왼쪽(오래된) 방향으로 순환
      // maxIndex(오른쪽 끝) → 0(왼쪽 끝) → maxIndex 무한 반복
      const nextIndex = currentIndex === 0 ? maxIndex : currentIndex - 1;
      onIndexChange(nextIndex);
    }, 10000); // 10초마다 슬라이드

    return () => clearInterval(slideTimer);
  }, [autoSlideEnabled, isSwipping, maxIndex, currentIndex, onIndexChange]);

  // 페이지네이션 방식 계산
  const cardWidth = 100 / visibleCards; // 각 카드가 차지할 너비 (%)
  const baseTranslateX = currentIndex * 100; // 페이지 단위로 이동 (100%씩)
  const swipeTranslateX = isSwipping
    ? -(swipeOffset / window.innerWidth) * 100
    : 0; // 스와이프 중 추가 이동 (방향 반전)
  const translateX = baseTranslateX + swipeTranslateX;

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* 캐러셀 컨테이너 */}
      <div className="overflow-x-hidden overflow-y-visible pb-8">
        <div
          className={`flex ${
            isSwipping
              ? "duration-0"
              : "transition-transform duration-[2000ms] ease-in-out"
          }`}
          style={{
            transform: `translateX(-${translateX}%)`,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
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
        {Array.from({ length: Math.max(1, totalPages) }).map((_, index) => (
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
