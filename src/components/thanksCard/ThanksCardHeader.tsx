import { ThanksCardHeaderProps } from "./types";

/**
 * ThanksCard 페이지의 헤더 컴포넌트
 * 페이지 제목과 현재 시간을 표시합니다.
 */
export const ThanksCardHeader = ({ currentTime }: ThanksCardHeaderProps) => {
  return (
    <header className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-0">
        {/* 페이지 제목 */}
        <div className="text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-light text-slate-700 mb-2 lg:mb-3">
            기도와 감사의 나눔
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl text-slate-500 font-light">
            Prayer & Thanksgiving Wall
          </p>
        </div>

        {/* 시간 정보 */}
        <div className="text-center lg:text-right sm:block hidden">
          <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-slate-600 mb-1 lg:mb-2">
            {currentTime.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-slate-500">
            {currentTime.toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
