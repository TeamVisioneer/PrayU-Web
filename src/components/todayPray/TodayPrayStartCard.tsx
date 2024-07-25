import TodayPrayBtn from "./TodayPrayBtn";
import { useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import { getISOTodayDate } from "@/lib/utils";
interface GroupProps {
  currentUserId: string;
  groupId: string | undefined;
}

export const TodayPrayStartCard: React.FC<GroupProps> = ({
  currentUserId,
  groupId,
}) => {
  const startDt = getISOTodayDate(-6);
  const endDt = getISOTodayDate();
  const groupPrayCardList = useBaseStore((state) => state.groupPrayCardList);
  const fetchGroupPrayCardList = useBaseStore(
    (state) => state.fetchGroupPrayCardList
  );

  useEffect(() => {
    fetchGroupPrayCardList(groupId, startDt, endDt);
  }, [fetchGroupPrayCardList, groupId, startDt, endDt]);

  const otherPrayCardNumber = groupPrayCardList
    ? groupPrayCardList.filter(
        (prayCard) => prayCard?.user_id !== currentUserId
      )
    : [];

  return otherPrayCardNumber.length > 0 ? (
    <>
      <div className="flex flex-col  gap-2 border p-4 rounded-lg shadow-md bg-white justify-center items-center h-60vh">
        <div className="text-center">
          <h1 className="font-bold text-xl mb-5">오늘의 기도를 시작해보세요</h1>
          <h1>{otherPrayCardNumber.length}명의 기도제목이</h1>
          <h1 className="mb-5">당신의 기도를 기다리고 있어요</h1>
        </div>
        <TodayPrayBtn />
      </div>
    </>
  ) : (
    <>
      <div className="flex flex-col  gap-2 border p-4 rounded-lg shadow-md bg-white justify-center items-center h-60vh">
        <div className="text-center">
          <h1 className="font-bold text-xl mb-5">오늘의 기도를 시작해보세요</h1>
          <h1>그룹원들과 함께</h1>
          <h1 className="mb-5">기도제목을 공유하고 기도해 보아요</h1>
        </div>
        <TodayPrayBtn />
      </div>
    </>
  );
};

export default TodayPrayStartCard;
