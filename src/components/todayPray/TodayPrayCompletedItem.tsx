import { getISOTodayDateYMD } from "@/lib/utils";

const TodayPrayCompletedItem = () => {
  const today = getISOTodayDateYMD();
  const contentNumber = parseInt(today.day, 10) % 31;
  return (
    <div className="flex flex-col gap-4 justify-center items-center min-h-80vh max-h-80vh pb-10">
      <div className="h-[280px] w-full flex flex-col items-center">
        <img
          className="h-full rounded-md"
          src={`https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/BibleContent/content${contentNumber}.png`}
        />
      </div>
      <h1 className="font-bold text-xl">오늘의 기도 완료!</h1>
      <h3 className="text-gray-600">내일도 기도해 주실 거죠? 🤗</h3>
      <div className="text-gray-400 text-center">
        <h1>당신을 위해 기도한</h1>
        <h1>친구들을 확인해 보아요</h1>
      </div>
    </div>
  );
};

export default TodayPrayCompletedItem;
