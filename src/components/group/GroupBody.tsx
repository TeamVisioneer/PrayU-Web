import { Group } from "supabase/types/tables";
import useBaseStore from "@/stores/baseStore";
import TodayPrayCardList from "@/components/todayPray/TodayPrayCardList";
import MyMember from "@/components/member/MyMember";
import GroupLimitCard from "@/components/group/GroupLimitCard";
import OtherMemberList from "@/components/member/OtherMemberList";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import PrayCardCreateModal from "../prayCard/PrayCardCreateModal";
import { getISOTodayDate } from "@/lib/utils";

import { useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { Textarea } from "../ui/textarea";

interface GroupBodyProps {
  currentUserId: string;
  groupList: Group[];
  targetGroup: Group;
}

const GroupBody: React.FC<GroupBodyProps> = ({
  currentUserId,
  groupList,
  targetGroup,
}) => {
  const isOpenTodayPrayDrawer = useBaseStore(
    (state) => state.isOpenTodayPrayDrawer
  );
  const setIsOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setIsOpenTodayPrayDrawer
  );
  const isParamsGroupIdinGroupList = groupList.some(
    (group) => group.id === targetGroup.id
  );
  const maxGroupCount = Number(import.meta.env.VITE_MAX_GROUP_COUNT);

  const member = useBaseStore((state) => state.targetMember);
  const memberLoading = useBaseStore((state) => state.memberLoading);
  const getMember = useBaseStore((state) => state.getMember);

  useEffect(() => {
    if (targetGroup) getMember(currentUserId, targetGroup.id);
  }, [currentUserId, targetGroup, getMember]);

  if (memberLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  if (groupList.length == maxGroupCount && !isParamsGroupIdinGroupList) {
    return <GroupLimitCard />;
  }

  if (member == null || member.updated_at < getISOTodayDate(-6)) {
    return (
      <PrayCardCreateModal
        currentUserId={currentUserId}
        groupId={targetGroup.id}
        member={member}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col h-full gap-4">
        <Textarea className="bg-red-300" />
        <textarea className="bg-blue-300" />
        <MyMember currentUserId={currentUserId} groupId={targetGroup.id} />
        <OtherMemberList
          currentUserId={currentUserId}
          groupId={targetGroup.id}
        />
      </div>
      <Drawer
        open={isOpenTodayPrayDrawer}
        onOpenChange={setIsOpenTodayPrayDrawer}
      >
        <DrawerContent className="bg-mainBg max-w-[480px] mx-auto w-full pb-5">
          <DrawerHeader className="p-2">
            <DrawerTitle></DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>
          {/* TodayPrayCardList */}
          <TodayPrayCardList
            currentUserId={currentUserId}
            groupId={targetGroup.id}
          />
          {/* TodayPrayCardList */}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default GroupBody;
