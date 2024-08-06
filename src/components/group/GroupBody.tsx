import { Group } from "supabase/types/tables";
import useBaseStore from "@/stores/baseStore";
import PrayCardList from "@/components/prayCard/PrayCardList";
import MyMember from "@/components/member/MyMember";
import LimitGroupCard from "@/components/group/LimitGroupCard";
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
    return <LimitGroupCard />;
  }

  if (member == null || member.updated_at < getISOTodayDate(-6)) {
    return (
      <PrayCardCreateModal
        currentUserId={currentUserId}
        groupId={targetGroup?.id}
        member={member}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col h-full gap-4">
        <MyMember currentUserId={currentUserId} groupId={targetGroup.id} />
        <OtherMemberList
          currentUserId={currentUserId}
          groupId={targetGroup?.id}
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
          {/* PrayCardList */}
          <PrayCardList
            currentUserId={currentUserId}
            groupId={targetGroup?.id}
          />
          {/* PrayCardList */}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default GroupBody;
