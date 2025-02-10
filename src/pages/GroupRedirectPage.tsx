import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import GroupListHeader from "@/components/group/GroupListHeader";
import { analyticsTrack } from "@/analytics/analytics";

const GroupRedirectPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fetchMemberListByUserId = useBaseStore(
    (state) => state.fetchMemberListByUserId
  );
  const myMemberList = useBaseStore((state) => state.myMemberList);

  useEffect(() => {
    if (user) fetchMemberListByUserId(user.id);
  }, [fetchMemberListByUserId, user]);

  if (!myMemberList) return null;

  const addGroup = () => {
    analyticsTrack("클릭_그룹_추가", {});
    navigate("/group/new");
  };

  const handleGroupClick = (id: string) => {
    analyticsTrack("클릭_그룹_전환", { group_id: id });
    navigate(`/group/${id}`);
  };

  return (
    <div className="w-full h-full">
      <GroupListHeader
        userGroupList={myMemberList.map((member) => member.group)}
      />
      <section className="px-4">
        {myMemberList.length === 0 ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              그룹이 없습니다
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              새로운 그룹을 만들어 기도제목 나눔을 시작하세요
            </p>
          </div>
        ) : (
          <ul>
            {myMemberList.map((member) => (
              <li key={member.group.id}>
                <div
                  className="flex items-center space-x-4 py-3 cursor-pointer"
                  onClick={() => handleGroupClick(member.group.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.group.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {member.pray_summary}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {member.updated_at.split("T")[0].replace(/-/g, ".")}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="fixed bottom-0 w-full flex flex-col items-center p-4 pb-10 z-10">
        <Button variant="primary" onClick={() => addGroup()} className="w-2/3">
          <PlusCircle className="h-5 w-5 mr-2" />새 그룹 만들기
        </Button>
      </section>
    </div>
  );
};

export default GroupRedirectPage;
