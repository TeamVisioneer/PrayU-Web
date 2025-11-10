import React, { useRef, useCallback, useLayoutEffect } from "react";

interface WheelPickerProps {
  selectedHour: number | null;
  onChange: (hour: number | null) => void;
  className?: string;
}

const WheelPicker: React.FC<WheelPickerProps> = ({
  selectedHour,
  onChange,
  className = "",
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  const getSelectedTimeText = () => {
    if (selectedHour === null) {
      return "알림 없음";
    }
    const hour12 =
      selectedHour === 0
        ? 0
        : selectedHour > 12
        ? selectedHour - 12
        : selectedHour;
    const ampm = selectedHour < 12 ? "오전" : "오후";
    // 오전은 00, 01 형식, 오후는 1, 2 형식
    const hourDisplay =
      ampm === "오전" ? hour12.toString().padStart(2, "0") : hour12.toString();
    return `${ampm} ${hourDisplay}시`;
  };

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const scrollTop = scrollRef.current.scrollTop;
    const itemHeight = 48; // h-12 = 48px
    const containerHeight = 192; // h-48 = 192px
    const paddingTop = 80; // py-20 = 80px

    // 현재 뷰포트 중앙의 절대 위치
    const viewportCenter = scrollTop + containerHeight / 2;
    // 첫 번째 아이템의 중심 위치
    const firstItemCenter = paddingTop + itemHeight / 2;
    // 선택된 아이템 인덱스 계산 (0은 "알림 없음", 1~24는 시간)
    const selectedIndex = Math.round(
      (viewportCenter - firstItemCenter) / itemHeight
    );

    // 0 ~ 24 범위로 제한 (0은 "알림 없음", 1~24는 0~23시)
    const clampedIndex = Math.max(0, Math.min(24, selectedIndex));
    // 인덱스 0은 null(알림 없음), 1~24는 0~23시
    const newValue = clampedIndex === 0 ? null : clampedIndex - 1;

    if (newValue !== selectedHour) {
      onChange(newValue);
    }
  }, [selectedHour, onChange]);

  // 초기 스크롤 위치 설정 (useLayoutEffect로 렌더링 전에 실행)
  useLayoutEffect(() => {
    if (!scrollRef.current || isInitialized.current) return;

    const itemHeight = 48;
    const containerHeight = 192;
    const paddingTop = 80;

    // selectedHour가 null이면 인덱스 0(알림 없음), 아니면 인덱스 selectedHour + 1
    const targetIndex = selectedHour === null ? 0 : selectedHour + 1;

    // 초기 시간에 해당하는 아이템이 중앙에 오는 스크롤 위치 계산
    const selectedItemCenter =
      paddingTop + itemHeight / 2 + targetIndex * itemHeight;
    const scrollTop = selectedItemCenter - containerHeight / 2;

    scrollRef.current.scrollTop = Math.max(0, scrollTop);
    isInitialized.current = true;
  }, [selectedHour]);

  return (
    <div className={`relative mx-auto w-full max-w-xs ${className}`}>
      {/* 스크롤 컨테이너 */}
      <div
        ref={scrollRef}
        className="wheel-picker-scroll h-48 overflow-y-scroll rounded-lg bg-white scroll-smooth snap-y snap-mandatory"
        onScroll={handleScroll}
        style={{
          perspective: "1000px",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>
          {`
            .wheel-picker-scroll::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        <div className="py-20">
          {/* 알림 없음 옵션 */}
          <div
            className="h-12 flex items-center justify-center text-lg font-medium cursor-pointer snap-center transition-all duration-200 select-none opacity-40 hover:opacity-60"
            style={{
              transform: "scale(0.9)",
              transformOrigin: "center",
            }}
          >
            알림 없음
          </div>
          {/* 시간 옵션 (0~23시) */}
          {Array.from({ length: 24 }, (_, i) => {
            const hour12 = i === 0 ? 0 : i > 12 ? i - 12 : i;
            const ampm = i < 12 ? "오전" : "오후";
            // 오전은 00, 01 형식, 오후는 1, 2 형식
            const hourDisplay =
              ampm === "오전"
                ? hour12.toString().padStart(2, "0")
                : hour12.toString();
            return (
              <div
                key={i}
                className="h-12 flex items-center justify-center text-lg font-medium cursor-pointer snap-center transition-all duration-200 select-none opacity-40 hover:opacity-60"
                style={{
                  transform: "scale(0.9)",
                  transformOrigin: "center",
                }}
              >
                {ampm} {hourDisplay}시
              </div>
            );
          })}
        </div>
      </div>
      {/* 중앙 선택된 영역 강조 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full flex items-center justify-center">
          <div className="h-12 bg-blue-50/30 border-t-2 border-b-2 border-blue-500/50 rounded-md"></div>
        </div>
      </div>
      {/* 중앙 아이템 강조 오버레이 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full flex items-center justify-center">
          <div
            className="text-xl font-bold text-blue-600 bg-white rounded-lg px-4 py-2 shadow-sm border border-blue-200 whitespace-nowrap"
            style={{
              transform: "scale(1.1)",
              minWidth: "120px",
            }}
          >
            {getSelectedTimeText()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheelPicker;
