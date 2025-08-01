import { ThanksCardItemProps } from "./types";

/**
 * 텍스트를 지정된 길이로 자르고 말줄임표를 추가하는 유틸리티 함수
 */
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * 감사 카테고리 색상 (모든 카드가 감사 카테고리)
 */
const getCategoryColor = (): string => {
  return "bg-blue-200 text-blue-800";
};

/**
 * 날짜를 포맷팅하는 함수
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const formatted = date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return formatted;
};

/**
 * 기본 이미지 URL 배열 (Unsplash 자연 이미지)
 */
const defaultImages = [
  "https://images.unsplash.com/photo-1476234251651-f353703a034d?w=400&h=400&fit=crop&crop=center", // 자연 경관
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center", // 산과 호수
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop&crop=center", // 숲길
  "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=400&fit=crop&crop=center", // 해변 일몰
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop&crop=center", // 들판
  "https://images.unsplash.com/photo-1433838552652-f9a46b332c40?w=400&h=400&fit=crop&crop=center", // 바다와 하늘
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=400&fit=crop&crop=center", // 안개 낀 산
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center", // 호숫가
];

/**
 * 카드 ID에 기반하여 기본 이미지를 선택하는 함수
 */
const getDefaultImage = (cardId: string): string => {
  // 카드 ID의 해시값을 기반으로 이미지 선택
  let hash = 0;
  for (let i = 0; i < cardId.length; i++) {
    const char = cardId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 32비트 정수로 변환
  }
  const index = Math.abs(hash) % defaultImages.length;
  return defaultImages[index];
};

/**
 * 개별 감사 카드를 표시하는 컴포넌트
 * 반응형 디자인으로 모바일, 태블릿, 데스크톱에서 모두 최적화됩니다.
 */
export const ThanksCardItem = ({ card }: ThanksCardItemProps) => {
  return (
    <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
      {/* 타원형 카드 */}
      <div className="aspect-[3/5] bg-white rounded-[2rem] shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-700 flex flex-col">
        {/* 카드 내용 */}
        <div className="flex flex-col h-full px-4 sm:px-5 lg:px-6 py-4 sm:py-5 lg:py-6">
          {/* 상단 카테고리 */}
          <div className="flex justify-center items-center mb-3 sm:mb-4">
            <span
              className={`px-2 sm:px-3 py-1 rounded-full text-sm sm:text-base lg:text-lg font-medium ${getCategoryColor()}`}
            >
              {card.id} 번째
            </span>
          </div>

          {/* 제목 */}
          <div className="text-center mb-4 sm:mb-5 lg:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-medium text-slate-800 leading-tight">
              {card.user_name} 님의 감사기도
            </h2>
          </div>

          {/* 이미지 영역 */}
          <div className="flex-shrink-0 mb-4 sm:mb-5 lg:mb-6 flex justify-center">
            {card.image ? (
              <img
                src={card.image}
                alt={`${card.user_name}님의 감사기도`}
                className="w-full h-full aspect-square object-cover rounded-xl sm:rounded-2xl"
              />
            ) : (
              <img
                src={getDefaultImage(card.id.toString())}
                alt="감사 기본 이미지"
                className="w-full h-full aspect-square object-cover rounded-xl sm:rounded-2xl"
              />
            )}
          </div>

          {/* 내용 */}
          <div className="flex-grow flex items-center justify-center text-center mb-3 sm:mb-4">
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed text-slate-700">
              {truncateText(card.content, 80)}
            </p>
          </div>

          {/* 하단 날짜 정보 */}
          <div className="text-center mt-auto">
            <p className="text-xs sm:text-sm lg:text-base text-slate-500">
              {formatDate(card.created_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
