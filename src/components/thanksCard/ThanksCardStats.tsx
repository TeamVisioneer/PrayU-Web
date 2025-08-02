import { ThanksCardStatsProps } from "./types";
import CountUp from "react-countup";

/**
 * 감사 카드 통계 정보를 표시하는 컴포넌트
 * 총 감사 횟수와 참여 안내 메시지를 보여줍니다.
 */
export const ThanksCardStats = ({ totalCount }: ThanksCardStatsProps) => {
  return (
    <section className="bg-gradient-to-r from-slate-100 to-blue-100 py-6 lg:py-8">
      <div className="text-center px-2 sm:px-4 md:px-6 lg:px-8 overflow-x-auto">
        <p className="whitespace-nowrap text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-light text-slate-700 mb-2 lg:mb-3 inline-block">
          오늘까지 총{" "}
          <span className="text-blue-600 font-medium">
            <CountUp
              key={totalCount}
              start={0}
              end={totalCount}
              duration={4}
              separator=","
            />
          </span>
          명의 사람들이 감사했습니다
        </p>
        <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-slate-600 font-light">
          당신의 감사도 함께 나눠주세요 🙏
        </p>
      </div>
    </section>
  );
};
