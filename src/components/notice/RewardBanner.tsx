import { analyticsTrack } from "@/analytics/analytics";
import useBaseStore from "@/stores/baseStore";
import { getDateDistance } from "@toss/date";

const RewardBanner = () => {
  const setBannerDialogContent = useBaseStore(
    (state) => state.setBannerDialogContent
  );
  const setIsOpenBannerDialog = useBaseStore(
    (state) => state.setIsOpenBannerDialog
  );
  const targetGroup = useBaseStore((state) => state.targetGroup);

  if (!targetGroup) return null;

  const createdAt = new Date(targetGroup.created_at);
  const deadline = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
  const { hours, minutes, seconds } = getDateDistance(new Date(), deadline);
  if (hours == 0 && minutes == 0 && seconds == 0) return null;

  const onClickBanner = () => {
    analyticsTrack("클릭_베너_리워드", {});
    setBannerDialogContent("reward");
    setIsOpenBannerDialog(true);
  };

  return (
    <div
      className=" flex flex-col items-center p-2 gap-1 rounded-xl cursor-pointer bg-gradient-to-r from-start via-middle via-52% to-end"
      onClick={() => onClickBanner()}
    >
      <h1 className="text-sm font-bold">PrayU PlayList 가 도착했어요 🎁</h1>
      <p className="text-xs text-center">지금 바로 클릭하여 확인해보세요!</p>
    </div>
  );
};

export default RewardBanner;
