import { useEffect, useState, useCallback } from "react";
import {
  ThanksCardHeader,
  ThanksCardStats,
  ThanksCardCarousel,
  ThanksCardQRCode,
  ThanksCard,
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

  // Pagination 상태
  const CARDS_PER_FETCH = 10; // 한 번에 가져올 카드 수

  /**
   * 새로운 감사카드가 실시간으로 추가되었을 때 처리하는 함수
   */
  const handleThanksCardAdded = useCallback(async (newCard: ThanksCard) => {
    // 새로운 카드를 배열 맨 앞에 추가 (최신 카드이므로)
    setCards((prevCards) => [newCard, ...prevCards]);

    // 총 카드 수를 서버에서 다시 fetch
    try {
      const totalCount = await thanksCardController.getThanksCardStats();
      setTotalThanksCount(totalCount);
    } catch (error) {
      console.error("Failed to update total count:", error);
    }

    console.log("새로운 감사카드가 추가되었습니다:", newCard);
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
      } else {
        // API 실패 시 빈 배열 설정
        setCards([]);
        setHasMoreCards(false);
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
        setCards((prevCards) => [...prevCards, ...dbCards]);
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

  // 캐러셀 인덱스가 끝에 가까워지면 추가 데이터 로드
  useEffect(() => {
    const shouldLoadMore = currentCardIndex >= cards.length - 3; // 끝에서 3개 전에 미리 로드
    if (shouldLoadMore && hasMoreCards && !loading) {
      loadMoreCards();
    }
  }, [currentCardIndex, cards.length, hasMoreCards, loading]);

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
          cards={cards}
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
    </div>
  );
};

export default ThanksCardPage;
