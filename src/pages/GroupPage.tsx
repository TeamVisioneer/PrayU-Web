import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import useAuth from "../hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import { KakaoShareButton } from "@/components/KakaoShareBtn";
import OtherMemberList from "@/components/member/OtherMemberList";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import GroupMenuBtn from "../components/GroupMenuBtn";
import { getDomainUrl } from "@/lib/utils";
import PrayCardList from "@/components/prayCard/PrayCardList";
import TodayPrayBtn from "@/components/todayPray/TodayPrayBtn";
import TodayPrayStartCard from "@/components/todayPray/TodayPrayStartCard";
import MyMember from "@/components/member/MyMember";

const GroupPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { groupId: paramsGroupId } = useParams();

  const groupList = useBaseStore((state) => state.groupList);
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const getGroup = useBaseStore((state) => state.getGroup);
  const fetchGroupListByUserId = useBaseStore(
    (state) => state.fetchGroupListByUserId
  );
  const openTodayPrayDrawer = useBaseStore(
    (state) => state.openTodayPrayDrawer
  );
  const setOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setOpenTodayPrayDrawer
  );

  const fetchIsPrayToday = useBaseStore((state) => state.fetchIsPrayToday);
  const isPrayToday = useBaseStore((state) => state.isPrayToday);

  useEffect(() => {
    fetchGroupListByUserId(user!.id);
    if (paramsGroupId) getGroup(paramsGroupId);
  }, [fetchGroupListByUserId, user, paramsGroupId, getGroup]);

  useEffect(() => {
    if (!paramsGroupId && groupList) {
      if (groupList.length === 0) {
        navigate("/group/new", { replace: true });
        return;
      } else {
        navigate(`/group/${groupList[0].id}`, { replace: true });
        return;
      }
    }
  }, [groupList, navigate, paramsGroupId]);

  useEffect(() => {
    if (targetGroup) fetchIsPrayToday(user!.id, targetGroup.id);
  }, [user, targetGroup, fetchIsPrayToday]);

  if (!groupList || (paramsGroupId && !targetGroup) || isPrayToday == null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  const domainUrl = getDomainUrl();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between">
        <div className="flex flex-grow justify-center items-center gap-2">
          <div className="text-lg font-bold">{targetGroup?.name}</div>
          <KakaoShareButton
            groupPageUrl={`${domainUrl}/group/${targetGroup?.id}`}
          ></KakaoShareButton>
        </div>
        <GroupMenuBtn userGroupList={groupList} targetGroup={targetGroup} />
      </div>
      <div className="flex flex-col gap-2">
        <MyMember currentUserId={user!.id} groupId={targetGroup?.id} />
        {isPrayToday ? (
          <OtherMemberList
            currentUserId={user!.id}
            groupId={targetGroup?.id}
          ></OtherMemberList>
        ) : (
          <TodayPrayStartCard />
        )}
      </div>

      <div>
        <Drawer
          open={openTodayPrayDrawer}
          onOpenChange={setOpenTodayPrayDrawer}
        >
          <DrawerContent className="max-w-[480px] mx-auto w-full h-[90%] pb-20">
            <DrawerHeader>
              <DrawerTitle></DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            {/* PrayCardList */}
            <PrayCardList currentUserId={user!.id} groupId={targetGroup?.id} />
            {/* PrayCardList */}
          </DrawerContent>
        </Drawer>
      </div>

      {isPrayToday && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2">
          <TodayPrayBtn />
        </div>
      )}
    </div>
  );
};

export default GroupPage;
