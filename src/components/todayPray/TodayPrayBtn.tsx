import useBaseStore from "@/stores/baseStore";
import { Button } from "../ui/button";
import { analyticsTrack } from "@/analytics/analytics";
import { getISOTodayDate } from "@/lib/utils";

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
  const fetchGroupPrayCardList = useBaseStore(
    (state) => state.fetchGroupPrayCardList
  );
  const user = useBaseStore((state) => state.user);

  const onClickTodayPrayBtn = async (targetGroupId: string) => {
    setIsOpenTodayPrayDrawer(true);
    analyticsTrack("클릭_오늘의기도_시작", { where: eventOption.where });

    const startDt = getISOTodayDate(-6);
    const endDt = getISOTodayDate(1);
    fetchGroupPrayCardList(targetGroupId, user!.id, startDt, endDt);
  };

  return (
    <Button
      variant="primary"
      className="w-[188px] h-[46px] text-md font-bold rounded-[10px]"
      onClick={() => onClickTodayPrayBtn(targetGroup!.id)}
    >
      기도 시작하기
    </Button>
  );
};

export default TodayPrayBtn;
