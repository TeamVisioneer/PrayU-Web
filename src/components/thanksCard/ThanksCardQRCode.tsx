import { useState, useEffect } from "react";

/**
 * QR 코드를 표시하는 고정 위치 컴포넌트
 * 모바일에서는 + 버튼으로 축소하여 카드를 가리지 않도록 합니다.
 * 데스크톱에서는 항상 전체 크기로 표시됩니다.
 */
export const ThanksCardQRCode = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 모바일에서 축소된 + 버튼
  if (isMobile && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg border-2 border-white p-3 transition-all duration-300 z-10"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    );
  }

  // 전체 QR 코드 영역 (데스크톱 항상 표시 또는 모바일에서 확장된 상태)
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 bg-white rounded-2xl sm:rounded-3xl shadow-lg border-2 border-slate-200 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-all duration-500 z-10">
      {/* 모바일에서 닫기 버튼 */}
      {isMobile && (
        <button
          onClick={() => setIsExpanded(false)}
          className="absolute -top-2 -right-2 bg-slate-600 hover:bg-slate-700 text-white rounded-full p-2 shadow-lg transition-all duration-200 z-10"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      <div className="text-center">
        {/* QR 코드 영역 */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 xl:w-36 xl:h-36 bg-slate-100 rounded-xl sm:rounded-2xl mb-2 sm:mb-3 lg:mb-4 flex items-center justify-center shadow-inner">
          {/* QR 코드 자리 - 실제로는 QR 라이브러리 사용 */}
          <div className="text-slate-600 text-center">
            <svg
              className="w-12 h-12 sm:w-14 sm:h-14 lg:w-20 lg:h-20 xl:w-24 xl:h-24 mx-auto mb-1 sm:mb-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM19 13h2v2h-2zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM15 19h2v2h-2zM17 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2z" />
            </svg>
          </div>
        </div>

        {/* 안내 텍스트 */}
        <p className="text-sm sm:text-base lg:text-xl xl:text-2xl font-medium text-slate-700 mb-1">
          💝 감사 카드
        </p>
        <p className="text-xs sm:text-sm lg:text-lg xl:text-xl text-slate-500">
          QR 스캔하기
        </p>
      </div>
    </div>
  );
};
