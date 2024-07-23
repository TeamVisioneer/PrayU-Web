import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import useAuth from "../hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import { KakaoShareButton } from "@/components/KakaoShareBtn";
import MemberList from "@/components/member/MemberList";
import { Drawer } from "@/components/ui/drawer";
import PrayCardContent from "@/components/prayCard/PrayCardContent";
import GroupMenu from "../components/GroupMenuBtn";

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

  useEffect(() => {
    fetchGroupListByUserId(user?.id);
    if (paramsGroupId) getGroup(paramsGroupId);
  }, [fetchGroupListByUserId, user, paramsGroupId, getGroup]);

  useEffect(() => {
    if (!paramsGroupId && groupList) {
      if (groupList.length === 0) {
        navigate("/group/new");
        return;
      } else {
        navigate(`/group/${groupList[0].id}`);
        return;
      }
    }
  }, [groupList, navigate, paramsGroupId]);

  if (!groupList || (paramsGroupId && !targetGroup)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <GroupMenu userGroupList={groupList} targetGroup={targetGroup} />
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold">{targetGroup?.name} 그룹</div>
        <KakaoShareButton
          webUrl={`${import.meta.env.VITE_BASE_URL}/${targetGroup?.id}`}
        ></KakaoShareButton>
      </div>
      <Drawer>
        <MemberList
          currentUserId={user?.id}
          groupId={targetGroup?.id}
        ></MemberList>
        <PrayCardContent currentUserId={user!.id} />
      </Drawer>
    </div>
  );
};

export default GroupPage;
