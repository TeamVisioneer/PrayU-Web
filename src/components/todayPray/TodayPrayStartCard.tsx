import TodayPrayBtn from "./TodayPrayBtn";

export const TodayPrayStartCard = () => {
  return (
    <div className="flex flex-col  gap-2 border p-4 rounded-lg shadow-md bg-white justify-center items-center h-60vh">
      <div className="text-center">
        <h1 className="font-bold text-xl mb-5">오늘의 기도를 시작해보세요</h1>
        <h1>다른 그룹원들의 기도제목을</h1>
        <h1 className="mb-5">확인하고 반응해주세요</h1>
      </div>
      <TodayPrayBtn />
    </div>
  );
};

export default TodayPrayStartCard;
