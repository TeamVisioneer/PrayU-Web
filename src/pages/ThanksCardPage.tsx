import { useEffect, useState } from "react";
import {
  ThanksCardHeader,
  ThanksCardStats,
  ThanksCardCarousel,
  ThanksCardQRCode,
  ThanksCard,
} from "@/components/thanksCard";

// Mock data for development - 실제로는 API에서 가져올 데이터
const mockThanksCards: ThanksCard[] = [
  {
    id: "1",
    title: "새로운 직장에 대한 감사",
    content:
      "하나님께서 좋은 직장을 주셔서 감사합니다. 새로운 환경에서도 하나님을 증거하는 삶을 살겠습니다.",
    author: "김성도",
    category: "감사",
    image:
      "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=400&fit=crop&crop=center",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "가족의 건강을 위한 기도",
    content:
      "아버지의 수술이 잘 되도록 기도해주세요. 회복 과정에서 하나님의 치유하심이 있기를 소망합니다.",
    author: "이은혜",
    category: "기도요청",
    createdAt: "2024-01-14",
  },
  {
    id: "3",
    title: "주님의 사랑에 대한 찬양",
    content:
      "십자가의 사랑을 알게 하시고, 매일 새로운 은혜로 채워주시는 하나님을 찬양합니다.",
    author: "박찬양",
    category: "찬양",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center",
    createdAt: "2024-01-13",
  },
  {
    id: "4",
    title: "믿음 안에서의 변화",
    content:
      "예수님을 만난 후 삶이 완전히 바뀌었습니다. 과거의 습관들을 끊고 새로운 피조물이 되었음을 간증합니다.",
    author: "최간증",
    category: "간증",
    createdAt: "2024-01-12",
  },
  {
    id: "5",
    title: "선교사역에 대한 감사",
    content:
      "올해 단기선교에서 많은 영혼들을 만나게 해주셔서 감사합니다. 계속해서 복음 전파에 힘쓰겠습니다.",
    author: "정선교",
    category: "감사",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop&crop=center",
    createdAt: "2024-01-11",
  },
];

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
  const [cards] = useState<ThanksCard[]>(mockThanksCards);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [totalThanksCount] = useState(3058);

  // 실시간 시계 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 자동 슬라이드는 ThanksCardCarousel 컴포넌트에서 처리

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* 헤더 섹션 */}
      <ThanksCardHeader currentTime={currentTime} />

      {/* 통계 정보 섹션 */}
      <ThanksCardStats totalCount={totalThanksCount} />

      {/* 메인 카드 캐러셀 */}
      <ThanksCardCarousel
        cards={cards}
        currentIndex={currentCardIndex}
        onIndexChange={setCurrentCardIndex}
      />

      {/* QR 코드 영역 */}
      <ThanksCardQRCode />
    </div>
  );
};

export default ThanksCardPage;
