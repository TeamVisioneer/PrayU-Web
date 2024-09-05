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
  const targetGroup = useBaseStore((state) => state.targetGroup);

  const onClickTodayPrayBtn = async (targetGroupId: string) => {
    const kakaoToken = await KakaoTokenRepo.init(
      `groupId:${targetGroupId};from:TodayPrayDrawer`
    );
    if (!kakaoToken) return null;
    window.history.pushState(null, "", window.location.pathname);
    setIsOpenTodayPrayDrawer(true);
    analyticsTrack("클릭_오늘의기도_시작", { where: eventOption.where });
  };

  return (
    <Button
      variant="primary"
      className="w-[166px] h-[48px] text-md font-bold rounded-[10px]"
      onClick={() => onClickTodayPrayBtn(targetGroup!.id)}
    >
      기도 시작하기
    </Button>
  );
};

export default TodayPrayBtn;
