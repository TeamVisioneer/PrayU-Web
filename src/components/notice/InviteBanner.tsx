import { analyticsTrack } from "@/analytics/analytics";
import useBaseStore from "@/stores/baseStore";
import { getDateDistance } from "@toss/date";
import { useEffect, useState } from "react";
import OpenShareDrawerBtn from "../share/OpenShareDrawerBtn";

const InviteBanner = () => {
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const groupList = useBaseStore((state) => state.groupList);
  const setBannerDialogData = useBaseStore(
    (state) => state.setBannerDialogData
  );
  const setIsOpenBannerDialog = useBaseStore(
    (state) => state.setIsOpenBannerDialog
  );
  const [dateDistance, setDateDistance] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const { hours, minutes, seconds } = dateDistance;

  useEffect(() => {
    if (!targetGroup) return;
    const updateDateDistance = () => {
      const createdAt = new Date(targetGroup.created_at);
      const deadline = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
      const dateDistance = getDateDistance(new Date(), deadline);
      setDateDistance(dateDistance);
    };
    updateDateDistance();
    const intervalId = setInterval(updateDateDistance, 1000);
    return () => clearInterval(intervalId);
  }, [targetGroup]);

  if (!targetGroup || !groupList) return null;
  if (groupList.length > 1) return null;
  if (hours == 0 && minutes == 0 && seconds == 0) return null;

  const EventContent = (
    <div className="flex flex-col items-center">
      <section className="h-80 w-full flex justify-center">
        <img src="/images/PlayListCover.png" className="h-80" />
      </section>
      <section className="flex flex-col items-center gap-3">
        <h1 className="text-lg font-bold">PrayU 초대 완료 이벤트</h1>
        <div className="text-sm text-gray-400 text-center">
          <p>24시간 내에 그룹원 초대를 완료할 경우</p>
          <p>PrayU PlayList Vol.1 PDF를 제공해 드립니다!</p>
        </div>
        <OpenShareDrawerBtn
          text="친구 초대하기"
          eventOption={{ where: "BannerDialog" }}
        />
      </section>
    </div>
  );

  const onClickBanner = () => {
    analyticsTrack("클릭_베너_초대", { group_id: targetGroup.id });
    setBannerDialogData(EventContent);
    setIsOpenBannerDialog(true);
  };

  return (
    <div
      className=" flex flex-col items-center p-2 gap-1 rounded-xl cursor-pointer bg-gradient-to-r from-start via-middle via-52% to-end"
      onClick={() => onClickBanner()}
    >
      <p className="text-sm font-bold">
        그룹원 초대 완료하면 전원 PrayU PlayList 제공!
      </p>
      <div className="flex gap-1 items-center text-xs">
        <p>🚨 마감까지</p>
        <div className="flex items-center gap-1 font-extrabold text-red-500 text-center ">
          <span className="w-11 bg-[#FBEBED]  p-1 rounded-sm">{hours}시간</span>
          <span className="w-10 bg-[#FBEBED]  p-1 rounded-sm">{minutes}분</span>
          <span className="w-10 bg-[#FBEBED]  p-1 rounded-sm">{seconds}초</span>
        </div>
        <span>남았습니다</span>
      </div>
    </div>
  );
};

export default InviteBanner;
