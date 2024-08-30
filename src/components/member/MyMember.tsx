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
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import MyPrayCardUI from "../prayCard/MyPrayCardUI";
import { analyticsTrack } from "@/analytics/analytics";
import { getISOTodayDate } from "@/lib/utils";
import PrayListDrawer from "../pray/PrayListDrawer";

interface MemberProps {
  currentUserId: string;
  groupId: string;
}

const MyMember: React.FC<MemberProps> = ({ currentUserId, groupId }) => {
  const member = useBaseStore((state) => state.myMember);
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
  const setIsOpenMyPrayDrawer = useBaseStore(
    (state) => state.setIsOpenMyPrayDrawer
  );

  const onClickMyMemberReaction = (event: { stopPropagation: () => void }) => {
    window.history.pushState(null, "", window.location.pathname);
    setIsOpenMyPrayDrawer(true);
    event.stopPropagation();
    analyticsTrack("클릭_기도카드_반응결과", {
      where: "MyMember",
    });
  };

  useEffect(() => {
    getMember(currentUserId, groupId);
    fetchUserPrayCardListByGroupId(currentUserId, groupId);
  }, [getMember, fetchUserPrayCardListByGroupId, currentUserId, groupId]);

  useEffect(() => {
    if (member) setPrayCardContent(member.pray_summary || "");
  }, [setPrayCardContent, member]);

  const prayCard = userPrayCardList?.[0] || null;
  const prayDatasForMe = prayCard?.pray;
  const prayDatasForMeToday = prayDatasForMe?.filter(
    (pray) => pray.created_at > getISOTodayDate()
  );

  const MyMemberUI = (
    <div className="w-full flex flex-col gap-3 cursor-pointer bg-white p-[25px] rounded-[15px] shadow-member">
      <div className="flex flex-col gap-1">
        <h3 className="flex font-bold text-lg">내 기도제목</h3>
        <div className="text-left text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
          {inputPrayCardContent || "✏️ 기도카드를 작성해주세요"}
        </div>
      </div>

      <div className="flex gap-2">
        <div
          className="w-fit flex bg-gray-100 rounded-lg px-[12px] py-2 gap-[16px]"
          onClick={(event) => onClickMyMemberReaction(event)}
        >
          {Object.values(PrayType).map((type) => {
            return (
              <div key={type} className="flex items-center gap-1 ">
                <img
                  src={PrayTypeDatas[type].img}
                  alt={PrayTypeDatas[type].emoji}
                  className="w-4 h-4 opacity-90"
                />
                <p className="text-sm text-dark">
                  {prayCard
                    ? prayCard.pray.filter((pray) => pray.pray_type === type)
                        .length
                    : 0}
                </p>
              </div>
            );
          })}
        </div>
        {prayDatasForMeToday && prayDatasForMeToday.length > 0 && (
          <p className="flex items-center text-gray-500 text-[10px]">
            오늘 기도해 준 사람이 있어요😊
          </p>
        )}
      </div>
    </div>
  );

  const onClickMyMember = () => {
    window.history.pushState(null, "", window.location.pathname);
    setIsOpenMyMemberDrawer(true);
    analyticsTrack("클릭_멤버_본인", {
      group_id: groupId,
      where: "MyMember",
    });
  };

  return (
    <>
      <Drawer
        open={isOpenMyMemberDrawer}
        onOpenChange={setIsOpenMyMemberDrawer}
      >
        <DrawerTrigger
          className="focus:outline-none"
          onClick={() => onClickMyMember()}
        >
          {MyMemberUI}
        </DrawerTrigger>

        <DrawerContent className="bg-mainBg max-w-[480px] mx-auto w-full px-10 pb-10 focus:outline-none">
          <DrawerHeader className="p-2">
            <DrawerTitle></DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>
          {/* PrayCard */}
          <MyPrayCardUI
            currentUserId={currentUserId}
            groupId={groupId}
            member={member}
          />
          {/* PrayCard */}
        </DrawerContent>
      </Drawer>
      <PrayListDrawer currentUserId={currentUserId} groupId={groupId} />
    </>
  );
};

export default MyMember;
