import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import qrcodeProd from "@/assets/QRcode/qrcode_thanks_card_prod.png";
import qrcodeStaging from "@/assets/QRcode/qrcode_thanks_card_staging.png";

/**
 * QR 코드를 표시하는 고정 위치 컴포넌트
 * 모바일에서는 + 버튼으로 축소하여 카드를 가리지 않도록 합니다.
 * 데스크톱에서는 항상 전체 크기로 표시됩니다.
 */
export const ThanksCardQRCode = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // 환경에 따른 QR 코드 이미지 선택
  const getQRCodeImage = () => {
    // production 환경이면 prod 이미지, 아니면 staging 이미지 사용
    return import.meta.env.VITE_ENV === "prod" ? qrcodeProd : qrcodeStaging;
  };

  // QR 코드 클릭 시 생성 페이지로 이동
  const handleQRClick = () => {
    navigate("/thanks-card/new");
  };

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
        onClick={handleQRClick}
        className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 z-10 rounded-full border-2 border-white bg-blue-600 p-3 text-white shadow-lg transition-all duration-300 hover:bg-blue-700"
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
    <div
      onClick={handleQRClick}
      className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 z-10 cursor-pointer rounded-2xl border-2 border-slate-200 bg-white p-3 shadow-lg transition-all duration-500 hover:shadow-xl sm:right-6 sm:rounded-3xl sm:p-4 lg:right-8 lg:p-6"
    >
      {/* 모바일에서 닫기 버튼 */}
      {isMobile && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(false);
          }}
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
        <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 xl:w-36 xl:h-36 bg-white rounded-xl sm:rounded-2xl mb-2 sm:mb-3 lg:mb-4 flex items-center justify-center shadow-inner overflow-hidden">
          {/* 실제 QR 코드 이미지 */}
          <img
            src={getQRCodeImage()}
            alt="감사 카드 QR 코드"
            className="w-full h-full object-contain p-1"
          />
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
