import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";
import { analyticsTrack } from "@/analytics/analytics";
import { getISOTodayDate, sleep } from "@/lib/utils";
import { MemberWithProfiles } from "supabase/types/tables";
import ReactionResultBox from "../pray/ReactionResultBox";

interface MemberProps {
  myMember: MemberWithProfiles;
}

const MyMember: React.FC<MemberProps> = ({ myMember }) => {
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

  const currentUserId = myMember.user_id!;
  const groupId = myMember.group_id!;

  useEffect(() => {
    if (userPrayCardList?.[0]) {
      setPrayCardContent(userPrayCardList[0].content || "");
      setPrayCardLife(userPrayCardList[0].life || "");
    }
  }, [setPrayCardContent, myMember, setPrayCardLife, userPrayCardList]);

  const prayCard = userPrayCardList?.[0];
  const prayDatasForMe = prayCard ? prayCard.pray : [];
  const prayDatasForMeToday = prayDatasForMe?.filter(
    (pray) =>
      pray.created_at > getISOTodayDate() && pray.user_id !== currentUserId
  );

  const onClickMyMember = async () => {
    setIsOpenMyMemberDrawer(true);
    analyticsTrack("클릭_멤버_본인", {
      group_id: groupId,
      where: "MyMember",
    });
    sleep(100);
    await fetchUserPrayCardListByGroupId(currentUserId, groupId);
  };

  return (
    <div
      onClick={() => onClickMyMember()}
      className="w-full flex flex-col gap-3 cursor-pointer bg-white p-6 rounded-[15px]"
    >
      <div className="flex flex-col gap-1">
        <h3 className="flex font-bold text-lg">내 기도제목</h3>
        <div className="text-left text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
          {inputPrayCardContent || "✏️ 기도카드를 작성해 보아요"}
        </div>
      </div>

      <div className="flex gap-2">
        <ReactionResultBox
          prayData={prayDatasForMe}
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
