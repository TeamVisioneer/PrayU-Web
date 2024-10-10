import useBaseStore from "@/stores/baseStore";
import { Button } from "../ui/button";
import { analyticsTrack } from "@/analytics/analytics";
import { getISOTodayDate, sleep } from "@/lib/utils";

interface EventOption {
  where: string;
}
interface TodayPrayBtnProps {
  eventOption: EventOption;
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
  const setIsOpenMyPrayDrawer = useBaseStore(
    (state) => state.setIsOpenMyPrayDrawer
  );
  const setIsOpenMyMemberDrawer = useBaseStore(
    (state) => state.setIsOpenMyMemberDrawer
  );

  if (!myMember || !targetGroup) return null;

  const onClickTodayPrayBtn = async (targetGroupId: string) => {
    setIsOpenTodayPrayDrawer(true);
    setIsOpenMyPrayDrawer(false);
    setIsOpenMyMemberDrawer(false);
    analyticsTrack("클릭_오늘의기도_시작", { where: eventOption.where });

    sleep(100);
    setPrayCardCarouselList([]);
    const startDt = getISOTodayDate(-6);
    const todayDt = getISOTodayDate();
    const endDt = getISOTodayDate(1);
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
    setPrayCardCarouselList(filterdGroupPrayCardList);
  };

  return (
    <Button
      variant="primary"
      className="w-[188px] h-[46px] text-md font-bold rounded-[10px]"
      onClick={() => onClickTodayPrayBtn(targetGroup.id)}
    >
      기도 시작하기
    </Button>
  );
};

export default TodayPrayBtn;
