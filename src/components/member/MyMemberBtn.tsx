import useBaseStore from "@/stores/baseStore";
import { Button } from "../ui/button";
import { analyticsTrack } from "@/analytics/analytics";

const MyMemberBtn: React.FC = () => {
  const setIsOpenMyMemberDrawer = useBaseStore(
    (state) => state.setIsOpenMyMemberDrawer
  );
  const setIsOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setIsOpenTodayPrayDrawer
  );

  const onClickMyMemberBtn = () => {
    window.history.pushState(null, "", window.location.pathname);
    setIsOpenTodayPrayDrawer(false);
    setIsOpenMyMemberDrawer(true);
    analyticsTrack("클릭_멤버_본인", { where: "PrayCardList" });
    analyticsTrack("클릭_오늘의기도_완료", {});
  };

  return (
    <Button
      variant="primary"
      className="w-32"
      onClick={() => {
        onClickMyMemberBtn();
      }}
    >
      내 기도 확인하기
    </Button>
  );
};

export default MyMemberBtn;
