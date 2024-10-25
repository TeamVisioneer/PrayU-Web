import React, { useEffect } from "react";
import CountUp from "react-countup";
import useBaseStore from "@/stores/baseStore";

const HookingMessage: React.FC = () => {
  const totalPrayCount = useBaseStore((state) => state.totalPrayCount);
  const fetchTotalPrayCount = useBaseStore(
    (state) => state.fetchTotalPrayCount
  );

  useEffect(() => {
    fetchTotalPrayCount();
  }, [fetchTotalPrayCount]);

  return (
    <div
      className="relative w-full max-w-screen h-[480px] overflow-hidden"
      style={{
        backgroundImage: `url(/images/HookingImg.png)`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        paddingBottom: "100%", // 1:1 비율
      }}
    >
      {/* 텍스트를 이미지의 하단에 배치 */}
      <div className="absolute left-0 right-0 text-base p-2 text-center bg-opacity-50 bottom-1 ">
        <p className="text-white leading-tight gmarket-font">
          <CountUp
            start={0}
            end={totalPrayCount}
            duration={1.5}
            separator=","
            className="text-indigo-800 font-extrabold"
          />{" "}
          번의 기도가
        </p>
        <p className="text-white leading-tight gmarket-font">
          PrayU 를 통해 전달되었어요
        </p>
      </div>
    </div>
  );
};

export default HookingMessage;
