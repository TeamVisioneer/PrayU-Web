import TodayPrayBtn from "./TodayPrayBtn";

export const TodayPrayStartCard = () => {
  return (
    <>
      <div className="flex flex-col  gap-2 border p-4 rounded-lg shadow-md bg-white justify-center items-center h-60vh">
        <div className="text-center">
          <h1 className="font-bold text-xl mb-5">오늘의 기도를 시작해보세요</h1>
          <h1>여러 명의 기도제목이</h1>
          <h1 className="mb-5">당신의 기도를 기다리고 있어요</h1>
        </div>
        <TodayPrayBtn />
      </div>
    </>
  );
};

export default TodayPrayStartCard;
