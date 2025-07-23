import { ThanksCardItemProps, ThanksCard as ThanksCardType } from "./types";

/**
 * 텍스트를 지정된 길이로 자르고 말줄임표를 추가하는 유틸리티 함수
 */
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * 카테고리별 색상을 반환하는 함수
 */
const getCategoryColor = (category: ThanksCardType["category"]): string => {
  const colors = {
    감사: "bg-blue-200 text-blue-800",
    기도요청: "bg-green-200 text-green-800",
    찬양: "bg-purple-200 text-purple-800",
    간증: "bg-orange-200 text-orange-800",
  };
  return colors[category];
};

/**
 * 날짜를 포맷팅하는 함수
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
};

/**
 * 개별 감사 카드를 표시하는 컴포넌트
 * 반응형 디자인으로 모바일, 태블릿, 데스크톱에서 모두 최적화됩니다.
 */
export const ThanksCardItem = ({ card }: ThanksCardItemProps) => {
  return (
    <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
      {/* 타원형 카드 */}
      <div className="aspect-[2/3] bg-white rounded-[2rem] sm:rounded-[3rem] lg:rounded-[4rem] shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-700 flex flex-col">
        {/* 카드 내용 */}
        <div className="flex flex-col h-full px-4 sm:px-5 lg:px-6 py-4 sm:py-5 lg:py-6">
          {/* 상단 카테고리 */}
          <div className="flex justify-center items-center mb-3 sm:mb-4">
            <span
              className={`px-2 sm:px-3 py-1 rounded-full text-sm sm:text-base lg:text-lg font-medium ${getCategoryColor(
                card.category
              )}`}
            >
              {card.category}
            </span>
          </div>

          {/* 제목 */}
          <div className="text-center mb-4 sm:mb-5 lg:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-medium text-slate-800 leading-tight">
              {card.author} 님의 감사기도
            </h2>
          </div>

          {/* 이미지 영역 */}
          <div className="flex-shrink-0 mb-4 sm:mb-5 lg:mb-6 flex justify-center">
            {card.image ? (
              <img
                src={card.image}
                alt={`${card.author}님의 감사기도`}
                className="w-full h-full aspect-square object-cover rounded-xl sm:rounded-2xl shadow-md"
              />
            ) : (
              <div className="w-full h-full aspect-square bg-slate-100 rounded-xl sm:rounded-2xl shadow-md flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <svg
                    className="w-12 h-12 sm:w-14 sm:h-14 lg:w-20 lg:h-20 xl:w-24 xl:h-24 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-xs sm:text-sm lg:text-lg text-slate-400">
                    감사 사진
                  </p>
                </div>
              </div>
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
              {formatDate(card.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
