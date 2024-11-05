import useBaseStore from "@/stores/baseStore";
import TodayPrayBtn from "./TodayPrayBtn";

export const TodayPrayStartCard = () => {
  const memberList = useBaseStore((state) => state.memberList);

  if (!memberList) return null;
  return (
    <div className="w-full flex-grow flex flex-col items-center">
      <div className="relative flex flex-col w-[85%] flex-grow justify-center items-center max-h-[500px]">
        <div className="absolute w-14 h-[95%] left-0 bottom-0 transform origin-bottom-left rotate-[-3deg] opacity-50 bg-gradient-to-t from-[#FFDAD7] via-[#FFE5F8] via-41.75% to-[#AAC7FF] rounded-2xl shadow-prayCard z-0"></div>
        <div className="absolute w-14 h-[95%]  right-0 bottom-0 transform origin-bottom-right rotate-[3deg] opacity-50 bg-gradient-to-t from-[#FFDAD7] via-[#FFE5F8] via-41.75% to-[#AAC7FF] rounded-2xl shadow-prayCard z-0"></div>
        <div className="flex w-full flex-col flex-grow py-10 justify-center items-center text-center gap-5 border rounded-2xl shadow-prayCard bg-gradient-to-t from-[#FFF8F8] via-[#FFEBFA] via-41.75% to-[#AAC7FF] z-10 opacity-100">
          <section>
            <div className="flex flex-col gap-4">
              <h1 className="font-bold text-xl">오늘의 기도</h1>
              <div className="text-grayText">
                <h1>당신의 기도가 필요한 오늘,</h1>
                <h1>서로를 위해 기도해 보아요</h1>
              </div>
            </div>
            <div className="h-36 w-full">
              <img src="/images/Hand.png" className="h-full"></img>
            </div>
          </section>
          <TodayPrayBtn
            eventOption={{
              where: "TodayPrayStartCard",
              total_member: memberList.length,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TodayPrayStartCard;
