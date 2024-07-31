import useBaseStore from "@/stores/baseStore";
import { Button } from "../ui/button";

const TodayPrayBtn: React.FC = () => {
  const setIsOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setIsOpenTodayPrayDrawer
  );

  return (
    <Button
      variant="primary"
      className="w-32"
      onClick={() => setIsOpenTodayPrayDrawer(true)}
    >
      기도 시작하기
    </Button>
  );
};

export default TodayPrayBtn;
