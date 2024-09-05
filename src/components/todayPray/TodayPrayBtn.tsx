import useBaseStore from "@/stores/baseStore";
import { Button } from "../ui/button";
import { analyticsTrack } from "@/analytics/analytics";
import { KakaoTokenRepo } from "../kakao/KakaoTokenRepo";

interface EventOption {
  where: string;
}
interface TodayPrayBtnProps {
  eventOption: EventOption;
}

const TodayPrayBtn: React.FC<TodayPrayBtnProps> = ({ eventOption }) => {
  const setIsOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setIsOpenTodayPrayDrawer
  );
  const onClickTodayPrayBtn = async () => {
    await KakaoTokenRepo.init();
    window.history.pushState(null, "", window.location.pathname);
    setIsOpenTodayPrayDrawer(true);
    analyticsTrack("클릭_오늘의기도_시작", { where: eventOption.where });
  };

  return (
    <Button
      variant="primary"
      className="w-[166px] h-[48px] text-md font-bold rounded-[10px]"
      onClick={() => onClickTodayPrayBtn()}
    >
      기도 시작하기
    </Button>
  );
};

export default TodayPrayBtn;
