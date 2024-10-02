import TodayPrayBtn from "./TodayPrayBtn";

export const TodayPrayStartCard = () => {
  return (
    <div className="flex relative flex-grow justify-center items-center">
      <div className="absolute w-[260px] h-[337px] transform origin-bottom-left rotate-[-5.35deg] opacity-50 bg-gradient-to-t from-[#FFDAD7] via-[#FFE5F8] via-41.75% to-[#AAC7FF] rounded-2xl shadow-prayCard z-0"></div>
      <div className="absolute w-[260px] h-[337px] transform origin-bottom-right rotate-[5.35deg] opacity-50 bg-gradient-to-t from-[#FFDAD7] via-[#FFE5F8] via-41.75% to-[#AAC7FF] rounded-2xl shadow-prayCard z-0"></div>
      <div className="flex w-[273px] h-[381px] flex-col justify-center items-center text-center gap-8 border rounded-2xl shadow-prayCard bg-gradient-to-t from-[#FFF8F8] via-[#FFEBFA] via-41.75% to-[#AAC7FF] z-10 opacity-100">
        <div className="flex justify-center items-center gap-2"></div>
        <div className="flex flex-col gap-4">
          <h1 className="font-bold text-xl">오늘의 기도</h1>
          <div className="">
            <h1>당신의 기도가 필요한 오늘,</h1>
            <h1>함께 기도하며 서로의 길을 비춰주세요.</h1>
          </div>
        </div>
        <img src={"/images/Hand.png"} className="w-24 h-24 "></img>
        <TodayPrayBtn eventOption={{ where: "TodayPrayStartCard" }} />
      </div>
    </div>
  );
};

export default TodayPrayStartCard;
