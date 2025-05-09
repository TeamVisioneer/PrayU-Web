import useBaseStore from "@/stores/baseStore";
import { Button } from "../ui/button";
import { analyticsTrack } from "@/analytics/analytics";
import { getISOTodayDate, getWeekInfo, getNextDate } from "@/lib/utils";
import { Play } from "lucide-react";

interface TodayPrayBtnProps {
  eventOption: { where: string };
}

const TodayPrayBtn: React.FC<TodayPrayBtnProps> = ({ eventOption }) => {
  const myMember = useBaseStore((state) => state.myMember);
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const memberList = useBaseStore((state) => state.memberList);

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
        className="w-48 h-12 text-md rounded-[10px]"
        onClick={() => {
          onClickTodayPrayBtnNoUser();
        }}
      >
        기도 시작하기
      </Button>
    );

  const onClickTodayPrayBtn = async (targetGroupId: string) => {
    analyticsTrack("클릭_오늘의기도_시작", {
      ...eventOption,
      total_member: memberList?.length || 0,
    });

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
      className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 px-8 py-5 h-auto rounded-xl active:scale-95"
      onClick={() => onClickTodayPrayBtn(targetGroup.id)}
    >
      <div className="flex items-center gap-3">
        <Play className="h-5 w-5" />
        <span className="text-lg font-medium">기도 시작하기</span>
      </div>
    </Button>
  );
};

export default TodayPrayBtn;
