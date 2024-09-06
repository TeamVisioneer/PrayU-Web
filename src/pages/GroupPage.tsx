import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import GroupMenuBtn from "../components/group/GroupMenuBtn";
import GroupBody from "@/components/group/GroupBody";
import ShareDrawer from "@/components/share/ShareDrawer";
import OpenShareDrawerBtn from "@/components/share/OpenShareDrawerBtn";
import { ClipLoader } from "react-spinners";
import ContentDrawer from "@/components/share/ContentDrawer";
import OpenEventDialogBtn from "@/components/notice/OpenEventDialogBtn";
import EventDialog from "@/components/notice/EventDialog";

const GroupPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { groupId: paramsGroupId } = useParams();
  const groupList = useBaseStore((state) => state.groupList);
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const targetGroupLoading = useBaseStore((state) => state.targetGroupLoading);
  const getGroup = useBaseStore((state) => state.getGroup);
  const memberList = useBaseStore((state) => state.memberList) || [];
  const fetchMemberListByGroupId = useBaseStore(
    (state) => state.fetchMemberListByGroupId
  );
  const fetchGroupListByUserId = useBaseStore(
    (state) => state.fetchGroupListByUserId
  );

  useEffect(() => {
    fetchGroupListByUserId(user!.id);
    if (paramsGroupId) getGroup(paramsGroupId);
    if (paramsGroupId) fetchMemberListByGroupId(paramsGroupId);
  }, [
    fetchGroupListByUserId,
    fetchMemberListByGroupId,
    user,
    paramsGroupId,
    getGroup,
  ]);

  if (targetGroupLoading == false && targetGroup == null)
    window.location.replace("/group/not-found");

  if (!targetGroup || !memberList || !groupList) {
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

      <GroupBody
        currentUserId={user!.id}
        groupList={groupList}
        targetGroup={targetGroup}
      />

      <ShareDrawer />
      <ContentDrawer />
      <EventDialog />
    </div>
  );
};

export default GroupPage;
