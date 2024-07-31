import useBaseStore from "@/stores/baseStore";

const TodayPrayBtn: React.FC = () => {
  const setIsOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setIsOpenTodayPrayDrawer
  );

  return (
    <button
      className="shadow-md
        flex justify-center items-center w-32 h-11
        bg-todayPrayBtn text-white
        rounded-xl cursor-pointer"
      onClick={() => setIsOpenTodayPrayDrawer(true)}
    >
      기도 시작하기
    </button>
  );
};

export default TodayPrayBtn;
