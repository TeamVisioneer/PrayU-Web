import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import { KakaoShareButton } from "@/components/KakaoShareBtn";

import GroupMenuBtn from "../components/GroupMenuBtn";
import { getDomainUrl } from "@/lib/utils";

import inviteMemberIcon from "@/assets/inviteMemberIcon.svg";
import GroupBody from "@/components/group/GroupBody";

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
    return null;
  }

  const domainUrl = getDomainUrl();

  return (
    <div className="flex flex-col gap-5">
      <div className="relative flex justify-between items-center">
        <KakaoShareButton
          groupPageUrl={`${domainUrl}/group/${targetGroup?.id}`}
          id="groupPage"
          img={inviteMemberIcon}
        ></KakaoShareButton>
        <div className="absolute left-1/2 transform -translate-x-1/2 flex justify-center items-center gap-1">
          <div className="text-lg font-bold">{targetGroup?.name}</div>
        </div>
        <GroupMenuBtn userGroupList={groupList} targetGroup={targetGroup} />
      </div>

      <GroupBody
        currentUserId={user!.id}
        groupList={groupList}
        targetGroup={targetGroup}
      />
    </div>
  );
};

export default GroupPage;
