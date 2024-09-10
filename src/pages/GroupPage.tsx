import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import GroupMenuBtn from "../components/group/GroupMenuBtn";
import ShareDrawer from "@/components/share/ShareDrawer";
import OpenShareDrawerBtn from "@/components/share/OpenShareDrawerBtn";
import { ClipLoader } from "react-spinners";
import ContentDrawer from "@/components/share/ContentDrawer";
import OpenEventDialogBtn from "@/components/notice/OpenEventDialogBtn";
import EventDialog from "@/components/notice/EventDialog";
import ReportAlert from "@/components/alert/ReportAlert";
import { useNavigate } from "react-router-dom";
import { getISOTodayDate } from "@/lib/utils";
import MyMember from "@/components/member/MyMember";
import OtherMemberList from "@/components/member/OtherMemberList";
import TodayPrayCardListDrawer from "@/components/todayPray/TodayPrayCardListDrawer";

const GroupPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { groupId } = useParams();
  const groupList = useBaseStore((state) => state.groupList);
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const targetGroupLoading = useBaseStore((state) => state.targetGroupLoading);
  const getGroup = useBaseStore((state) => state.getGroup);
  const memberList = useBaseStore((state) => state.memberList);
  const getMember = useBaseStore((state) => state.getMember);
  const myMember = useBaseStore((state) => state.myMember);
  const memberLoading = useBaseStore((state) => state.memberLoading);
  const fetchMemberListByGroupId = useBaseStore(
    (state) => state.fetchMemberListByGroupId
  );
  const fetchGroupListByUserId = useBaseStore(
    (state) => state.fetchGroupListByUserId
  );
  const maxGroupCount = Number(import.meta.env.VITE_MAX_GROUP_COUNT);
  const userPlan = useBaseStore((state) => state.userPlan);

  useEffect(() => {
    fetchGroupListByUserId(user!.id);
    if (groupId) getMember(user!.id, groupId);
    if (groupId) getGroup(groupId);
    if (groupId) fetchMemberListByGroupId(groupId);
  }, [
    fetchGroupListByUserId,
    fetchMemberListByGroupId,
    getMember,
    user,
    groupId,
    getGroup,
  ]);

  useEffect(() => {
    if (
      !memberLoading &&
      (myMember == null || myMember.updated_at < getISOTodayDate(-6))
    ) {
      navigate(`/group/${groupId}/praycard/new`, { replace: true });
      return;
    }
    if (
      groupList &&
      groupList.length >= maxGroupCount &&
      !groupList.some((group) => group.id === groupId) &&
      userPlan != "Premium"
    ) {
      navigate("/group/limit", { replace: true });
      return;
    }
    if (targetGroupLoading == false && targetGroup == null) {
      navigate("/group/not-found");
      return;
    }
  }, [
    navigate,
    memberLoading,
    myMember,
    groupId,
    groupList,
    targetGroup,
    targetGroupLoading,
    maxGroupCount,
    userPlan,
  ]);

  if (!targetGroup || !memberList || !groupList || !myMember) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={20} color={"#70AAFF"} loading={true} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-5">
      <div className="relative flex justify-between items-center">
        <OpenShareDrawerBtn
          text="초대"
          eventOption={{ where: "GroupPage" }}
          type="tag"
        />
        <div className="text-lg font-bold flex items-center gap-1">
          <div className="max-w-52 whitespace-nowrap overflow-hidden text-ellipsis">
            {targetGroup.name}
          </div>
          <span className="text-sm text-gray-500">{memberList.length}</span>
        </div>
        <div className="w-[48px] flex justify-between">
          <OpenEventDialogBtn />
          <GroupMenuBtn userGroupList={groupList} targetGroup={targetGroup} />
        </div>
      </div>
      <div className="flex flex-col h-full gap-4">
        <MyMember myMember={myMember} />
        <OtherMemberList currentUserId={user!.id} groupId={targetGroup.id} />
      </div>

      <TodayPrayCardListDrawer
        currentUserId={user!.id}
        groupId={targetGroup.id}
      />
      <ShareDrawer />
      <ContentDrawer />
      <EventDialog />
      <ReportAlert />
    </div>
  );
};

export default GroupPage;
