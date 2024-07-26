import useBaseStore from "@/stores/baseStore";
import { Button } from "../ui/button";

const TodayPrayBtn: React.FC = () => {
  const setOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setOpenTodayPrayDrawer
  );

  return (
    <Button
      className="className= 
        flex flex-col justify-center w-32 h-12
        bg-blue-950 text-white
        rounded-full cursor-pointer"
      onClick={() => setOpenTodayPrayDrawer(true)}
    >
      오늘의 기도
    </Button>
  );
};

export default TodayPrayBtn;
