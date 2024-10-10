import useBaseStore from "@/stores/baseStore";
import { getDateDistance } from "@toss/date";
import { useEffect, useState } from "react";

const InviteBanner = () => {
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const [dateDistance, setDateDistance] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

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

  if (!targetGroup) return null;
  if (
    dateDistance.hours == 0 &&
    dateDistance.minutes == 0 &&
    dateDistance.seconds == 0
  )
    return null;

  const onClickBanner = () => {};

  return (
    <div
      className=" flex flex-col items-center p-2 gap-1 rounded-xl bg-gradient-to-r from-start via-middle via-52% to-end"
      onClick={() => onClickBanner()}
    >
      <p className="text-sm font-bold">
        하루 안에 3명 초대 완료하면 기프티콘 증정!
      </p>
      <div className="flex gap-1 items-center text-xs">
        <p>🚨 마감까지</p>
        <div className="flex items-center gap-1 font-extrabold text-red-500 text-center ">
          <span className="w-10 bg-[#FBEBED]  p-1 rounded-sm">
            {dateDistance.hours}시간
          </span>
          <span className="w-10 bg-[#FBEBED]  p-1 rounded-sm">
            {dateDistance.minutes}분
          </span>
          <span className="w-10 bg-[#FBEBED]  p-1 rounded-sm">
            {dateDistance.seconds}초
          </span>
        </div>
        <span className="text-end">남았습니다</span>
      </div>
    </div>
  );
};

export default InviteBanner;
