import useBaseStore from "@/stores/baseStore";
import { Button } from "../ui/button";
import { analyticsTrack } from "@/analytics/analytics";

interface TodayPrayBtnProps {
  where: string;
}

const TodayPrayBtn: React.FC<TodayPrayBtnProps> = ({ where }) => {
  const setIsOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setIsOpenTodayPrayDrawer
  );
  const onClickTodayPrayBtn = () => {
    setIsOpenTodayPrayDrawer(true);
    analyticsTrack("클릭_오늘의기도_시작", { where: where });
  };

  return (
    <Button
      variant="primary"
      className="w-32"
      onClick={() => onClickTodayPrayBtn()}
    >
      기도 시작하기
    </Button>
  );
};

export default TodayPrayBtn;
