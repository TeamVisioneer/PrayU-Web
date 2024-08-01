import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import { KakaoShareButton } from "@/components/KakaoShareBtn";
import GroupMenuBtn from "../components/GroupMenuBtn";
import { getDomainUrl } from "@/lib/utils";
import inviteMemberIcon from "@/assets/inviteMemberIcon.svg";
import GroupBody from "@/components/group/GroupBody";
import { analyticsTrack } from "@/analytics/analytics";

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

  useEffect(() => {
    if (targetGroup) fetchMemberListByGroupId(targetGroup.id);
  }, [fetchMemberListByGroupId, targetGroup]);

  if (!groupList || (paramsGroupId && !targetGroup) || isPrayToday == null) {
    return null;
  }

  const domainUrl = getDomainUrl();

  const handleMenuButtonClick = () => {
    analyticsTrack("클릭_그룹_메뉴", {
      group_id: targetGroup?.id,
      group_name: targetGroup?.name,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="relative flex justify-between items-center">
        <KakaoShareButton
          groupPageUrl={`${domainUrl}/group/${targetGroup?.id}`}
          id="groupPage"
          img={inviteMemberIcon}
        />

        <div className="absolute left-1/2 transform -translate-x-1/2 flex justify-center items-center gap-1">
          <div className="text-lg font-bold flex items-center gap-1">
            {targetGroup?.name}
            <span className="text-sm text-gray-500">{memberList?.length}</span>
          </div>
        </div>

        <GroupMenuBtn
          userGroupList={groupList}
          targetGroup={targetGroup}
          onClick={handleMenuButtonClick}
        />
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
