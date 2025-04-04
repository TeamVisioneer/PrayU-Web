import useBaseStore from "@/stores/baseStore";
import { Button } from "../ui/button";
import { analyticsTrack } from "@/analytics/analytics";
import { getISOTodayDate, getWeekInfo, getNextDate } from "@/lib/utils";

interface TodayPrayBtnProps {
  eventOption: { where: string; total_member: number };
}

const TodayPrayBtn: React.FC<TodayPrayBtnProps> = ({ eventOption }) => {
  const myMember = useBaseStore((state) => state.myMember);
  const targetGroup = useBaseStore((state) => state.targetGroup);

  const fetchGroupPrayCardList = useBaseStore(
    (state) => state.fetchGroupPrayCardList
  );
  const setPrayCardCarouselList = useBaseStore(
    (state) => state.setPrayCardCarouselList
  );
  const setIsOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setIsOpenTodayPrayDrawer
  );
  const setIsPrayToday = useBaseStore((state) => state.setIsPrayToday);
  const setIsOpenLoginDrawer = useBaseStore(
    (state) => state.setIsOpenLoginDrawer
  );

  const onClickTodayPrayBtnNoUser = () => {
    setIsOpenLoginDrawer(true);
  };

  if (!myMember || !targetGroup)
    return (
      <Button
        variant="primary"
        className="w-48 h-12 text-md font-bold rounded-[10px]"
        onClick={() => {
          onClickTodayPrayBtnNoUser();
        }}
      >
        기도 시작하기
      </Button>
    );

  const onClickTodayPrayBtn = async (targetGroupId: string) => {
    analyticsTrack("클릭_오늘의기도_시작", eventOption);

    setIsOpenTodayPrayDrawer(true);
    setPrayCardCarouselList(null);
    const todayDt = getISOTodayDate();
    const startDt = getWeekInfo(todayDt).weekDates[0];
    const endDt = getNextDate(getWeekInfo(todayDt).weekDates[6]);
    const groupPrayCardList = await fetchGroupPrayCardList(
      targetGroupId,
      myMember.profiles.id,
      startDt,
      endDt
    );
    const filterdGroupPrayCardList = groupPrayCardList
      ? groupPrayCardList
          .filter(
            (prayCard) =>
              prayCard.user_id &&
              prayCard.pray?.filter((pray) => pray.created_at >= todayDt)
                .length == 0 &&
              !myMember.profiles.blocking_users.includes(prayCard.user_id)
          )
          .sort((prayCard) => (prayCard.user_id === myMember.user_id ? -1 : 1))
      : [];
    if (filterdGroupPrayCardList.length == 0) setIsPrayToday(true);
    setPrayCardCarouselList(filterdGroupPrayCardList);
  };

  return (
    <Button
      variant="primary"
      className="w-48 h-12 text-md font-bold rounded-[10px]"
      onClick={() => onClickTodayPrayBtn(targetGroup.id)}
    >
      기도 시작하기
    </Button>
  );
};

export default TodayPrayBtn;
