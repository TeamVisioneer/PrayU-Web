import React, { useRef, useCallback, useLayoutEffect } from "react";

interface WheelPickerProps {
  selectedHour: number;
  onChange: (hour: number) => void;
  className?: string;
}

const WheelPicker: React.FC<WheelPickerProps> = ({
  selectedHour,
  onChange,
  className = "",
}) => {
  // 초기값 파싱 (한 번만 실행)

  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  const getSelectedTimeText = () => {
    const hour12 =
      selectedHour === 0
        ? 12
        : selectedHour > 12
        ? selectedHour - 12
        : selectedHour;
    const ampm = selectedHour < 12 ? "오전" : "오후";
    return `${ampm} ${hour12}시`;
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
    // 선택된 아이템 인덱스 계산
    const selectedIndex = Math.round(
      (viewportCenter - firstItemCenter) / itemHeight
    );

    // 0-23 범위로 제한
    const clampedIndex = Math.max(0, Math.min(23, selectedIndex));

    if (clampedIndex !== selectedHour) {
      onChange(clampedIndex);
    }
  }, [selectedHour, onChange]);

  // 초기 스크롤 위치 설정 (useLayoutEffect로 렌더링 전에 실행)
  useLayoutEffect(() => {
    if (!scrollRef.current || isInitialized.current) return;

    const itemHeight = 48;
    const containerHeight = 192;
    const paddingTop = 80;

    // 초기 시간에 해당하는 아이템이 중앙에 오는 스크롤 위치 계산
    const selectedItemCenter =
      paddingTop + itemHeight / 2 + selectedHour * itemHeight;
    const scrollTop = selectedItemCenter - containerHeight / 2;

    scrollRef.current.scrollTop = Math.max(0, scrollTop);
    isInitialized.current = true;
  }, [selectedHour]);

  return (
    <div className={`relative mx-auto w-full max-w-xs ${className}`}>
      {/* 스크롤 컨테이너 */}
      <div
        ref={scrollRef}
        className="h-48 overflow-y-auto scrollbar-hide rounded-lg bg-white scroll-smooth snap-y snap-mandatory"
        onScroll={handleScroll}
        style={{
          perspective: "1000px",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
        }}
      >
        <div className="py-20">
          {Array.from({ length: 24 }, (_, i) => {
            const hour12 = i === 0 ? 12 : i > 12 ? i - 12 : i;
            const ampm = i < 12 ? "오전" : "오후";
            return (
              <div
                key={i}
                className="h-12 flex items-center justify-center text-lg font-medium cursor-pointer snap-center transition-all duration-200 select-none opacity-40 hover:opacity-60"
                style={{
                  transform: "scale(0.9)",
                  transformOrigin: "center",
                }}
              >
                {ampm} {hour12}시
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
