import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import GroupMenuBtn from "../components/group/GroupMenuBtn";
import GroupBody from "@/components/group/GroupBody";
import ShareDrawer from "@/components/share/ShareDrawer";
import OpenShareDrawerBtn from "@/components/share/OpenShareDrawerBtn";
import { ClipLoader } from "react-spinners";
import ContentDrawer from "@/components/share/ContentDrawer";
import OpenEventDialogBtn from "@/components/event/OpenEventDialogBtn";
import EventDialog from "@/components/event/EventDialog";

const GroupPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { groupId: paramsGroupId } = useParams();
  const groupList = useBaseStore((state) => state.groupList);
  const targetGroup = useBaseStore((state) => state.targetGroup);
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

  if (!groupList || !memberList || !targetGroup) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={20} color={"#70AAFF"} loading={true} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-5">
      <div className="relative flex justify-center items-center">
        <div className="absolute left-0">
          <OpenShareDrawerBtn
            text="초대"
            eventOption={{ where: "GroupPage" }}
            type="tag"
          />
        </div>

        <div className="text-lg font-bold flex items-center gap-1">
          <div className="max-w-52 whitespace-nowrap overflow-hidden text-ellipsis">
            {targetGroup.name}
          </div>
          <span className="text-sm text-gray-500">{memberList.length}</span>
        </div>

        <div className="flex absolute right-0 gap-3">
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
