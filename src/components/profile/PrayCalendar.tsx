const PrayCalendar = () => {
  return (
    <div className="aspect-[2.5] w-full flex-grow flex flex-col gap-1 bg-white p-5 rounded-xl">
      <div className="flex flex-row justify-between">
        <span className="items-start text-sm font-semibold">기도 캘린더</span>
        <span className="text-right text-xs font-semibold">2024년 10월</span>
      </div>
      <div className="border-t border-[#f7f7f7] my-2"></div>
    </div>
  );
};

export default PrayCalendar;
