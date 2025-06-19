import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import ShareDrawer from "@/components/share/ShareDrawer";
import { useNavigate } from "react-router-dom";
import MyMember from "@/components/member/MyMember";
import OtherMemberList from "@/components/member/OtherMemberList";
import TodayPrayCardListDrawer from "@/components/todayPray/TodayPrayCardListDrawer";
import GroupSettingsDialog from "@/components/group/GroupSettingsDialog";
import PrayListDrawer from "@/components/pray/PrayListDrawer";
import OtherMemberDrawer from "@/components/member/OtherMemberDrawer";
import BannerDialog from "@/components/notice/BannerDialog";
import GroupHeader from "@/components/group/GroupHeader";
import TextBanner from "@/components/member/textBanner";
import MyMemberDrawer from "@/components/member/MyMemberDrawer";
import TodayPrayBtn from "@/components/todayPray/TodayPrayBtn";
import NewPrayCardRedirectBtn from "@/components/prayCard/NewPrayCardRedirectBtn";

const GroupPage: React.FC = () => {
  const { user } = useAuth();
  const currentUserId = user!.id;
  const navigate = useNavigate();

  const { groupId } = useParams();
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const targetGroupLoading = useBaseStore((state) => state.targetGroupLoading);
  const getGroup = useBaseStore((state) => state.getGroup);
  const getProfile = useBaseStore((state) => state.getProfile);
  const getMember = useBaseStore((state) => state.getMember);
  const setIsGroupLeader = useBaseStore((state) => state.setIsGroupLeader);
  const myMember = useBaseStore((state) => state.myMember);
  const memberLoading = useBaseStore((state) => state.memberLoading);
  const fetchMemberListByGroupId = useBaseStore(
    (state) => state.fetchMemberListByGroupId
  );
  const fetchMemberCountByGroupId = useBaseStore(
    (state) => state.fetchMemberCountByGroupId
  );
  const hasPrayCardCurrentWeek = useBaseStore(
    (state) => state.hasPrayCardCurrentWeek
  );

  useEffect(() => {
    getProfile(user!.id);
    if (groupId) {
      getMember(currentUserId, groupId);
      getGroup(groupId);
      fetchMemberListByGroupId(groupId);
      fetchMemberCountByGroupId(groupId);
    }
  }, [
    fetchMemberListByGroupId,
    fetchMemberCountByGroupId,
    getMember,
    currentUserId,
    groupId,
    getGroup,
    getProfile,
    user,
  ]);

  useEffect(() => {
    if (memberLoading == false && myMember == null) {
      navigate(`/group/${groupId}/join`, { replace: true });
      return;
    }
    if (targetGroupLoading == false && targetGroup == null) {
      navigate("/group/not-found");
      return;
    }
  }, [
    navigate,
    groupId,
    targetGroup,
    targetGroupLoading,
    memberLoading,
    myMember,
  ]);

  useEffect(() => {
    if (targetGroup && targetGroup.user_id === currentUserId) {
      setIsGroupLeader(true);
    }
  }, [targetGroup, currentUserId, setIsGroupLeader]);

  return (
    <div className="flex flex-col h-full">
      <GroupHeader />
      <div className="flex flex-col px-5 pb-5 flex-grow gap-4">
        <div className="flex flex-col gap-2">
          <MyMember myMember={myMember} />
          {targetGroup?.group_union && (
            <TextBanner
              text={`${targetGroup.group_union.name} 공동체에서 함께 하는 기도 그룹이에요`}
            />
          )}
        </div>
        <OtherMemberList />
      </div>
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2">
        {hasPrayCardCurrentWeek ? (
          <TodayPrayBtn
            groupId={groupId}
            eventOption={{ where: "GroupPage" }}
          />
        ) : (
          <NewPrayCardRedirectBtn />
        )}
      </div>

      <TodayPrayCardListDrawer />
      <MyMemberDrawer />
      <OtherMemberDrawer />
      <PrayListDrawer />
      <ShareDrawer />
      <BannerDialog />
      <GroupSettingsDialog />
    </div>
  );
};

export default GroupPage;
