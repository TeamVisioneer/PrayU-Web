import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";
import MyPrayCardUI from "../prayCard/MyPrayCardUI";
import { analyticsTrack } from "@/analytics/analytics";
import { getISOTodayDate } from "@/lib/utils";
import { MemberWithProfiles } from "supabase/types/tables";
import { useNavigate } from "react-router-dom";
import ReactionResultBox from "../pray/ReactionResultBox";

interface MemberProps {
  myMember: MemberWithProfiles;
}

const MyMember: React.FC<MemberProps> = ({ myMember }) => {
  const navigate = useNavigate();

  const getMember = useBaseStore((state) => state.getMember);
  const fetchUserPrayCardListByGroupId = useBaseStore(
    (state) => state.fetchUserPrayCardListByGroupId
  );
  const userPrayCardList = useBaseStore((state) => state.userPrayCardList);
  const setPrayCardContent = useBaseStore((state) => state.setPrayCardContent);
  const inputPrayCardContent = useBaseStore(
    (state) => state.inputPrayCardContent
  );
  const isOpenMyMemberDrawer = useBaseStore(
    (state) => state.isOpenMyMemberDrawer
  );
  const setIsOpenMyMemberDrawer = useBaseStore(
    (state) => state.setIsOpenMyMemberDrawer
  );
  const setIsEditingPrayCard = useBaseStore(
    (state) => state.setIsEditingPrayCard
  );

  const currentUserId = myMember.user_id!;
  const groupId = myMember.group_id!;

  useEffect(() => {
    fetchUserPrayCardListByGroupId(currentUserId, groupId);
  }, [getMember, fetchUserPrayCardListByGroupId, currentUserId, groupId]);

  useEffect(() => {
    if (
      userPrayCardList &&
      (userPrayCardList.length == 0 ||
        userPrayCardList[0].created_at < getISOTodayDate(-6))
    ) {
      navigate(`/group/${groupId}/praycard/new`, { replace: true });
      return;
    }
  });

  useEffect(() => {
    setPrayCardContent(myMember.pray_summary || "");
  }, [setPrayCardContent, myMember]);

  const prayCard = userPrayCardList?.[0];
  const prayDatasForMe = prayCard ? prayCard.pray : [];
  const prayDatasForMeToday = prayDatasForMe?.filter(
    (pray) =>
      pray.created_at > getISOTodayDate() && pray.user_id !== currentUserId
  );

  const MyMemberUI = (
    <div className="w-full flex flex-col gap-3 cursor-pointer bg-white p-[25px] rounded-[15px] shadow-member">
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

  const onClickMyMember = () => {
    setIsOpenMyMemberDrawer(true);
    analyticsTrack("클릭_멤버_본인", {
      group_id: groupId,
      where: "MyMember",
    });
  };

  return (
    <Drawer
      open={isOpenMyMemberDrawer}
      onOpenChange={setIsOpenMyMemberDrawer}
      onClose={() => setIsEditingPrayCard(false)}
    >
      <DrawerTrigger
        className="focus:outline-none"
        onClick={() => onClickMyMember()}
      >
        {MyMemberUI}
      </DrawerTrigger>
      <DrawerContent className="bg-mainBg pb-10">
        <DrawerHeader className="p-0">
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        {/* PrayCard */}
        <MyPrayCardUI
          currentUserId={currentUserId}
          groupId={groupId}
          member={myMember}
        />
        {/* PrayCard */}
      </DrawerContent>
    </Drawer>
  );
};

export default MyMember;
