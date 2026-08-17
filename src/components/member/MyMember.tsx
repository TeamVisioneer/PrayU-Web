import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";
import { analyticsTrack } from "@/analytics/analytics";
import { getISOTodayDate, isCurrentWeek } from "@/lib/utils";
import { MemberWithProfiles } from "supabase/types/tables";
import ReactionResultBox from "../pray/ReactionResultBox";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface MemberProps {
  myMember: MemberWithProfiles | null;
}

const MyMember: React.FC<MemberProps> = ({ myMember }) => {
  const navigate = useNavigate();
  const fetchUserPrayCardListByGroupId = useBaseStore(
    (state) => state.fetchUserPrayCardListByGroupId
  );
  const userPrayCardList = useBaseStore((state) => state.userPrayCardList);
  const setPrayCardContent = useBaseStore((state) => state.setPrayCardContent);
  const inputPrayCardContent = useBaseStore(
    (state) => state.inputPrayCardContent
  );
  const setPrayCardLife = useBaseStore((state) => state.setPrayCardLife);
  const setIsOpenMyMemberDrawer = useBaseStore(
    (state) => state.setIsOpenMyMemberDrawer
  );
  const setHasPrayCardCurrentWeek = useBaseStore(
    (state) => state.setHasPrayCardCurrentWeek
  );

  useEffect(() => {
    if (myMember?.user_id && myMember?.group_id) {
      fetchUserPrayCardListByGroupId(myMember.user_id, myMember.group_id);
    }
  }, [myMember, fetchUserPrayCardListByGroupId]);

  useEffect(() => {
    if (userPrayCardList?.[0]) {
      setPrayCardContent(userPrayCardList[0].content || "");
      setPrayCardLife(userPrayCardList[0].life || "");
      setHasPrayCardCurrentWeek(
        isCurrentWeek(userPrayCardList?.[0]?.created_at)
      );
    }
  }, [
    setPrayCardContent,
    myMember,
    setPrayCardLife,
    userPrayCardList,
    setHasPrayCardCurrentWeek,
  ]);

  const prayCard = userPrayCardList?.[0];
  const prayDatasForMe = prayCard ? prayCard.pray : [];
  const prayDatasForMeToday = prayDatasForMe?.filter(
    (pray) =>
      pray.created_at > getISOTodayDate() && pray.user_id !== myMember?.user_id
  );

  const isExpired = prayCard && !isCurrentWeek(prayCard.created_at);

  const onClickMyMember = async () => {
    if (!myMember?.user_id || !myMember?.group_id) return;
    analyticsTrack("클릭_멤버_본인", {
      group_id: myMember.group_id,
      where: "MyMember",
    });
    if (!prayCard) {
      navigate("/praycard/new");
    } else {
      setIsOpenMyMemberDrawer(true);
      await fetchUserPrayCardListByGroupId(myMember.user_id, myMember.group_id);
    }
  };

  if (!myMember || !userPrayCardList) {
    return <Skeleton className="w-full rounded-2xl h-36  bg-gray-200 " />;
  }

  return (
    <div
      onClick={() => onClickMyMember()}
      className="w-full flex flex-col gap-3 cursor-pointer border border-glassBorder/50 bg-surfaceCard/70 shadow-member p-5 rounded-2xl h-36"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 justify-between">
          <h3 className="font-bold text-lg">내 기도제목</h3>
          {isExpired && (
            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
              만료됨
            </span>
          )}
        </div>
        {inputPrayCardContent ? (
          <div className="text-left text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
            {inputPrayCardContent}
          </div>
        ) : (
          <div className="text-left text-sm text-accentTo whitespace-nowrap overflow-hidden text-ellipsis font-medium">
            ✏️ 기도카드에 일상과 기도제목을 작성해 보아요
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <ReactionResultBox
          prayCard={prayCard}
          variant="combined"
          eventOption={{ where: "MyMember" }}
        />
        {prayDatasForMeToday && prayDatasForMeToday.length > 0 && (
          <p className="flex items-center text-gray-500 text-[10px]">
            오늘 기도해 준 사람이 있어요😊
          </p>
        )}
      </div>
    </div>
  );
};

export default MyMember;
