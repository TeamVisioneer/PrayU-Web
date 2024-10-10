import { analyticsTrack } from "@/analytics/analytics";
import { sleep } from "@/lib/utils";
import useBaseStore from "@/stores/baseStore";

interface TodayPrayReplayBtnProps {
  eventOption: { where: string };
}

const TodayPrayReplayBtn: React.FC<TodayPrayReplayBtnProps> = ({
  eventOption,
}) => {
  const myMember = useBaseStore((state) => state.myMember);
  const targetGroup = useBaseStore((state) => state.targetGroup);

  const setPrayCardCarouselList = useBaseStore(
    (state) => state.setPrayCardCarouselList
  );
  const setPrayCardCarouselIndex = useBaseStore(
    (state) => state.setPrayCardCarouselIndex
  );
  const setIsPrayToday = useBaseStore((state) => state.setIsPrayToday);
  const prayCardCarouselApi = useBaseStore(
    (state) => state.prayCardCarouselApi
  );
  const groupPrayCardList = useBaseStore((state) => state.groupPrayCardList);

  if (!myMember || !targetGroup) return null;

  const onClickTodayPrayReplayBtn = async () => {
    analyticsTrack("클릭_오늘의기도_다시보기", eventOption);
    const filterdGroupPrayCardList = groupPrayCardList
      ? groupPrayCardList
          .filter(
            (prayCard) =>
              prayCard.user_id &&
              !myMember.profiles.blocking_users.includes(prayCard.user_id)
          )
          .sort((prayCard) => (prayCard.user_id === myMember.user_id ? -1 : 1))
      : [];
    setPrayCardCarouselList(filterdGroupPrayCardList);
    setIsPrayToday(false);
    sleep(50).then(() => {
      prayCardCarouselApi?.scrollTo(1);
      setPrayCardCarouselIndex(1);
    });
  };

  return (
    <p
      className="cursor-pointer font-light"
      onClick={() => onClickTodayPrayReplayBtn()}
    >
      다시보기
    </p>
  );
};

export default TodayPrayReplayBtn;
