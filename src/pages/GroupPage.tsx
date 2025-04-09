import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import ShareDrawer from "@/components/share/ShareDrawer";
import EventDialog from "@/components/notice/EventDialog";
import ReportAlert from "@/components/alert/ReportAlert";
import { useNavigate } from "react-router-dom";
import { isCurrentWeek } from "@/lib/utils";
import MyMember from "@/components/member/MyMember";
import OtherMemberList from "@/components/member/OtherMemberList";
import TodayPrayCardListDrawer from "@/components/todayPray/TodayPrayCardListDrawer";
import { Skeleton } from "@/components/ui/skeleton";
import GroupSettingsDialog from "@/components/group/GroupSettingsDialog";
import PrayListDrawer from "@/components/pray/PrayListDrawer";
import OtherMemberDrawer from "@/components/member/OtherMemberDrawer";
import TodayPrayStartCard from "@/components/todayPray/TodayPrayStartCard";
import BannerDialog from "@/components/notice/BannerDialog";
import GroupHeader from "@/components/group/GroupHeader";
import WeekUpdateDialog from "@/components/notice/WeekUpdateDialog";
import TextBanner from "@/components/member/textBanner";
import MyMemberDrawer from "@/components/member/MyMemberDrawer";

const GroupPage: React.FC = () => {
  const { user } = useAuth();
  const currentUserId = user!.id;
  const navigate = useNavigate();

  const { groupId } = useParams();
  const groupList = useBaseStore((state) => state.groupList);
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const targetGroupLoading = useBaseStore((state) => state.targetGroupLoading);
  const getGroup = useBaseStore((state) => state.getGroup);
  const getMember = useBaseStore((state) => state.getMember);
  const setIsGroupLeader = useBaseStore((state) => state.setIsGroupLeader);
  const myMember = useBaseStore((state) => state.myMember);
  const memberList = useBaseStore((state) => state.memberList);
  const fetchMemberListByGroupId = useBaseStore(
    (state) => state.fetchMemberListByGroupId
  );
  const fetchMemberCountByGroupId = useBaseStore(
    (state) => state.fetchMemberCountByGroupId
  );
  const fetchGroupListByUserId = useBaseStore(
    (state) => state.fetchGroupListByUserId
  );
  const fetchTodayUserPrayByGroupId = useBaseStore(
    (state) => state.fetchTodayUserPrayByGroupId
  );
  const fetchUserPrayCardListByGroupId = useBaseStore(
    (state) => state.fetchUserPrayCardListByGroupId
  );
  const fetchNotificationCount = useBaseStore(
    (state) => state.fetchNotificationCount
  );
  const isPrayToday = useBaseStore((state) => state.isPrayToday);
  const userPrayCardList = useBaseStore((state) => state.userPrayCardList);

  useEffect(() => {
    fetchGroupListByUserId(currentUserId);
    if (groupId) {
      getMember(currentUserId, groupId);
      getGroup(groupId);
      fetchMemberListByGroupId(groupId);
      fetchMemberCountByGroupId(groupId);
      fetchUserPrayCardListByGroupId(currentUserId, groupId);
      fetchTodayUserPrayByGroupId(currentUserId, groupId);
      fetchNotificationCount(currentUserId, true);
    }
  }, [
    fetchGroupListByUserId,
    fetchMemberListByGroupId,
    fetchMemberCountByGroupId,
    getMember,
    fetchTodayUserPrayByGroupId,
    fetchUserPrayCardListByGroupId,
    fetchNotificationCount,
    currentUserId,
    groupId,
    getGroup,
  ]);

  useEffect(() => {
    if (!groupList) {
      return;
    } else if (groupList.every((group) => group.id !== groupId)) {
      // TODO: alert 창으로
      navigate(`/group/${groupId}/join`, { replace: true });
      return;
    } else if (
      userPrayCardList &&
      (userPrayCardList.length == 0 ||
        !isCurrentWeek(userPrayCardList[0].created_at))
    ) {
      navigate("/praycard/new", { replace: true });
      return;
    } else if (targetGroupLoading == false && targetGroup == null) {
      navigate("/group/not-found");
      return;
    }
  }, [
    navigate,
    groupId,
    groupList,
    userPrayCardList,
    targetGroup,
    targetGroupLoading,
  ]);

  useEffect(() => {
    if (targetGroup && targetGroup.user_id === currentUserId) {
      setIsGroupLeader(true);
    }
  }, [targetGroup, currentUserId, setIsGroupLeader]);

  if (!targetGroup || !groupList || !myMember || isPrayToday == null) {
    return (
      <div className="p-5 flex flex-col h-full gap-4 pt-[48px]">
        <Skeleton className="w-full h-[150px] flex items-center gap-4 p-4 bg-gray-200 rounded-xl" />
        <Skeleton className="w-full flex-grow flex items-center gap-4 p-4 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  const AllMemberExpired = memberList
    ?.filter(
      (member) =>
        member.user_id &&
        member.user_id !== currentUserId &&
        !myMember.profiles.blocking_users.includes(member.user_id)
    )
    .every((member) => !isCurrentWeek(member.updated_at));

  return (
    <div className="flex flex-col h-full">
      <GroupHeader />
      <div className="flex flex-col px-5 pb-5 flex-grow gap-4">
        <div className="flex flex-col gap-2">
          <MyMember myMember={myMember} />
          {targetGroup.group_union && (
            <TextBanner
              text={`${targetGroup.group_union.name} 공동체에서 함께 하는 기도 그룹이에요`}
            />
          )}
        </div>
        {isPrayToday || AllMemberExpired ? (
          <OtherMemberList />
        ) : (
          <TodayPrayStartCard />
        )}
      </div>

      <TodayPrayCardListDrawer />
      <MyMemberDrawer />
      <OtherMemberDrawer />
      <PrayListDrawer />
      <ShareDrawer />
      <EventDialog />
      <WeekUpdateDialog />
      <BannerDialog />
      <GroupSettingsDialog targetGroup={targetGroup} />
      <ReportAlert />
    </div>
  );
};

export default GroupPage;
