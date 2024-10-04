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

  return (
    <div className="w-[calc(100% + 20rem)] -mx-10 flex flex-col items-center p-2 gap-1 rounded-xl bg-gradient-to-r from-start via-middle via-52% to-end">
      <p className="text-sm">하루 안에 3명 초대 완료하면 기프티콘 증정!</p>
      <div className="flex text-xs">
        <p>🚨 마감까지</p>
        <div className="flex text-black">
          <span className="w-10 text-end">{dateDistance.hours}시간</span>
          <span className="w-7 text-end">{dateDistance.minutes}분</span>
          <span className="w-7 text-end">{dateDistance.seconds}초</span>
          <span className="w-7 text-end">남음</span>
        </div>
      </div>
    </div>
  );
};

export default InviteBanner;
