import { useEffect, useState, useCallback } from "react";
import {
  ThanksCardHeader,
  ThanksCardStats,
  ThanksCardCarousel,
  ThanksCardQRCode,
  ThanksCard,
  ThanksCardAnimationOverlay,
} from "@/components/thanksCard";
import { thanksCardController } from "@/apis/thanksCard";
import useRealtimeThanksCard from "@/components/thanksCard/useRealtimeThanksCard";

/**
 * 감사 카드 메인 페이지 컴포넌트
 * 반응형 디자인으로 모바일, 태블릿, 데스크톱에서 모두 최적화된 UI를 제공합니다.
 *
 * 주요 기능:
 * - 실시간 시계 표시
 * - 자동 슬라이드 캐러셀
 * - 반응형 카드 레이아웃 (모바일: 1개, 태블릿: 2개, 데스크톱: 3개)
 * - QR 코드를 통한 카드 작성 안내
 */
const ThanksCardPage = () => {
  // 상태 관리
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cards, setCards] = useState<ThanksCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [totalThanksCount, setTotalThanksCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMoreCards, setHasMoreCards] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [newCardForAnimation, setNewCardForAnimation] =
    useState<ThanksCard | null>(null);

  // Pagination 상태
  const CARDS_PER_FETCH = 10; // 한 번에 가져올 카드 수

  /**
   * 새로운 감사카드가 실시간으로 추가되었을 때 처리하는 함수
   */
  const handleThanksCardAdded = useCallback(async (newCard: ThanksCard) => {
    // 애니메이션을 위해 새 카드 설정
    setNewCardForAnimation(newCard);

    // 새로운 카드를 원본 배열 맨 앞에 추가 (reverse 후 오른쪽 끝에 표시됨)
    setCards((prevCards) => [newCard, ...prevCards]);

    // 새 카드가 원본 배열 맨 앞에 추가되므로 현재 인덱스는 그대로 유지
    // (reverse 후에는 맨 뒤(오른쪽)에 위치하게 됨)

    // 총 카드 수를 서버에서 다시 fetch
    try {
      const totalCount = await thanksCardController.getThanksCardStats();
      setTotalThanksCount(totalCount);
    } catch (error) {
      console.error("Failed to update total count:", error);
    }

    console.log("새로운 감사카드가 오른쪽 끝에 추가되었습니다:", newCard);
  }, []);

  // 실시간 감사카드 변경사항 구독
  useRealtimeThanksCard(handleThanksCardAdded);

  /**
   * 초기 데이터 로드 (총 개수 + 첫 번째 배치)
   */
  const loadInitialData = async () => {
    try {
      setLoading(true);

      // 1. 총 개수 조회
      const totalCount = await thanksCardController.getThanksCardStats();
      setTotalThanksCount(totalCount);

      // 2. 첫 번째 배치 데이터 조회
      const dbCards = await thanksCardController.fetchAllThanksCards(
        CARDS_PER_FETCH,
        0
      );

      if (dbCards && dbCards.length > 0) {
        setCards(dbCards);
        setHasMoreCards(
          dbCards.length === CARDS_PER_FETCH && dbCards.length < totalCount
        );
        // 초기 로드 시 마지막 페이지로 인덱스 설정
        setIsInitialLoad(false);
      } else {
        // API 실패 시 빈 배열 설정
        setCards([]);
        setHasMoreCards(false);
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error("Failed to load initial data:", error);
      // 에러 시 빈 배열 설정
      setCards([]);
      setHasMoreCards(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 추가 데이터 로드 (캐러셀에서 필요할 때)
   */
  const loadMoreCards = async () => {
    if (!hasMoreCards || loading) return;

    try {
      const offset = cards.length;
      const dbCards = await thanksCardController.fetchAllThanksCards(
        CARDS_PER_FETCH,
        offset
      );

      if (dbCards && dbCards.length > 0) {
        // 더 오래된 카드들을 뒤에 추가 (reverse 후 앞쪽에 위치하게 됨)
        setCards((prevCards) => [...prevCards, ...dbCards]);

        // 페이지네이션 방식에서는 기존 인덱스 유지 (같은 페이지의 카드들 계속 표시)
        // 카드가 뒤에 추가되므로 사용자가 보던 카드들의 위치는 변경되지 않음

        setHasMoreCards(
          dbCards.length === CARDS_PER_FETCH &&
            cards.length + dbCards.length < totalThanksCount
        );
      } else {
        setHasMoreCards(false);
      }
    } catch (error) {
      console.error("Failed to load more cards:", error);
      setHasMoreCards(false);
    }
  };

  // 실시간 시계 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  // 초기 로드 완료 후 오른쪽(최신 카드)에서 시작하도록 인덱스 설정
  useEffect(() => {
    if (!isInitialLoad && cards.length > 0) {
      // 오른쪽(최신)에서 시작하므로 마지막 페이지 인덱스로 설정
      const getVisibleCards = () => {
        if (typeof window === "undefined") return 3;
        const width = window.innerWidth;
        if (width < 640) return 1;
        if (width < 1024) return 2;
        if (width < 1440) return 3;
        if (width < 1920) return 4;
        return 5;
      };

      const visibleCards = getVisibleCards();
      // 페이지네이션 방식으로 maxIndex 계산 (캐러셀과 동일)
      const totalPages = Math.ceil(cards.length / visibleCards);
      const maxIndex = Math.max(0, totalPages - 1);
      setCurrentCardIndex(maxIndex);
    }
  }, [isInitialLoad, cards.length]);

  // 캐러셀 인덱스가 왼쪽(오래된 카드)에 가까워지면 추가 데이터 로드
  useEffect(() => {
    const shouldLoadMore = currentCardIndex <= 1; // 페이지 인덱스 1 이하일 때 미리 로드
    if (shouldLoadMore && hasMoreCards && !loading && !isInitialLoad) {
      loadMoreCards();
    }
  }, [currentCardIndex, hasMoreCards, loading, isInitialLoad]);

  // 로딩 중이면 로딩 화면 표시
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">감사 카드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* 헤더 섹션 */}
      <ThanksCardHeader currentTime={currentTime} />

      {/* 통계 정보 섹션 */}
      <ThanksCardStats totalCount={totalThanksCount} />

      {/* 메인 카드 캐러셀 또는 빈 상태 */}
      {cards.length > 0 ? (
        <ThanksCardCarousel
          cards={[...cards].reverse()}
          currentIndex={currentCardIndex}
          onIndexChange={setCurrentCardIndex}
        />
      ) : !loading ? (
        /* 로딩 완료 후 카드가 없을 때 보여줄 UI */
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-6xl mb-6">🙏</div>
            <h2 className="text-2xl font-medium text-slate-800 mb-4">
              아직 감사 카드가 없어요
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              첫 번째 감사 카드를 작성하여
              <br />
              소중한 감사의 마음을 나눠보세요
            </p>
            <div className="text-sm text-slate-500">
              아래 QR 코드를 통해 감사 카드를 만들 수 있어요 👇
            </div>
          </div>
        </div>
      ) : null}

      {/* QR 코드 영역 */}
      <ThanksCardQRCode />

      {/* 새 카드 생성 애니메이션 오버레이 */}
      <ThanksCardAnimationOverlay
        newCard={newCardForAnimation}
        onAnimationComplete={() => setNewCardForAnimation(null)}
      />
    </div>
  );
};

export default ThanksCardPage;
