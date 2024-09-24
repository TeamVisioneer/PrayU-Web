import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import OtherMember from "./OtherMember";
import TodayPrayBtn from "../todayPray/TodayPrayBtn";
import TodayPrayStartCard from "../todayPray/TodayPrayStartCard";
import { getISOTodayDate } from "@/lib/utils";
import OtherPrayCardUI from "../prayCard/OtherPrayCardUI";
import { MemberWithProfiles } from "supabase/types/tables";

interface OtherMembersProps {
  currentUserId: string;
  groupId: string;
  memberList: MemberWithProfiles[];
}

const OtherMemberList: React.FC<OtherMembersProps> = ({
  currentUserId,
  groupId,
  memberList,
}) => {
  const isPrayToday = useBaseStore((state) => state.isPrayToday);
  const fetchIsPrayToday = useBaseStore((state) => state.fetchIsPrayToday);
  const isOpenOtherMemberDrawer = useBaseStore(
    (state) => state.isOpenOtherMemberDrawer
  );

  const myMember = useBaseStore((state) => state.myMember);

  const setIsOpenOtherMemberDrawer = useBaseStore(
    (state) => state.setIsOpenOtherMemberDrawer
  );

  useEffect(() => {
    fetchIsPrayToday(currentUserId, groupId);
  }, [currentUserId, fetchIsPrayToday, groupId]);

  const otherMemberList = memberList.filter(
    (member) => member.user_id && member.user_id !== currentUserId
  );
  const isExpiredAllMember = otherMemberList.every(
    (member) => member.updated_at < getISOTodayDate(-6)
  );


  if (!myMember) return null;
  if (!isPrayToday && !isExpiredAllMember || otherMemberList.length == 0) return <TodayPrayStartCard />;
    
  return (
    <>
      <div className="flex flex-col gap-2 pb-10">
        <div className="text-sm text-gray-500 p-2">기도 구성원</div>
        <div className="flex flex-col gap-4">
          {otherMemberList.map((member) => (
            <OtherMember key={member.id} member={member}></OtherMember>
          ))}
        </div>
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2">
          <TodayPrayBtn eventOption={{ where: "OtherMemberList" }} />
        </div>
      </div>
      <Drawer
        open={isOpenOtherMemberDrawer}
        onOpenChange={setIsOpenOtherMemberDrawer}
      >
        <DrawerContent className="bg-mainBg pb-5">
          <DrawerHeader>
            <DrawerTitle></DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>
          {/* PrayCard */}
          <OtherPrayCardUI
            currentUserId={currentUserId}
            eventOption={{ where: "OtherMember" }}
          />
          {/* PrayCard */}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default OtherMemberList;
