import useBaseStore from "@/stores/baseStore";
import { Button } from "../ui/button";

const TodayPrayBtn: React.FC = () => {
  const setOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setOpenTodayPrayDrawer
  );

  return (
    <Button
      className="shadow-md
        flex flex-col justify-center w-32 h-11
        bg-todayPrayBtn text-white
        rounded-xl cursor-pointer"
      onClick={() => setOpenTodayPrayDrawer(true)}
    >
      기도 시작하기
    </Button>
  );
};

export default TodayPrayBtn;
