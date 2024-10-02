import { useEffect, useRef, useState } from "react";
import TodayPrayBtn from "./TodayPrayBtn";

export const TodayPrayStartCard = () => {
  const divRef = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (divRef.current) {
      const handleResize = () => {
        if (!divRef.current) return;
        setSize({
          width: divRef.current.offsetWidth,
          height: divRef.current.offsetHeight,
        });
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="relative flex flex-col w-[85%] flex-grow justify-center items-center max-h-[500px]">
        <div
          className="absolute left-0 bottom-0 transform origin-bottom-left rotate-[-3deg] opacity-50 bg-gradient-to-t from-[#FFDAD7] via-[#FFE5F8] via-41.75% to-[#AAC7FF] rounded-2xl shadow-prayCard z-0"
          style={{ width: size.width * 0.2, height: size.height * 0.95 }}
        ></div>
        <div
          className="absolute right-0 bottom-0 transform origin-bottom-right rotate-[3deg] opacity-50 bg-gradient-to-t from-[#FFDAD7] via-[#FFE5F8] via-41.75% to-[#AAC7FF] rounded-2xl shadow-prayCard z-0"
          style={{ width: size.width * 0.2, height: size.height * 0.95 }}
        ></div>
        <div
          className="flex w-full flex-col flex-grow py-10 justify-center items-center text-center gap-6 border rounded-2xl shadow-prayCard bg-gradient-to-t from-[#FFF8F8] via-[#FFEBFA] via-41.75% to-[#AAC7FF] z-10 opacity-100"
          ref={divRef}
        >
          <div className="flex flex-col gap-4">
            <h1 className="font-bold text-xl">오늘의 기도</h1>
            <div className="text-grayText">
              <h1>당신의 기도가 필요한 오늘,</h1>
              <h1>서로를 위해 기도해 보아요</h1>
            </div>
          </div>
          <img src={"/images/Hand.png"} className="w-24 h-24 "></img>
          <TodayPrayBtn eventOption={{ where: "TodayPrayStartCard" }} />
        </div>
      </div>
    </div>
  );
};

export default TodayPrayStartCard;
