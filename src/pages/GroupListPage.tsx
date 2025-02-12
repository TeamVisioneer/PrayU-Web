import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { FaCircleCheck } from "react-icons/fa6";
import useAuth from "../hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import { Button } from "@/components/ui/button";
import { analyticsTrack } from "@/analytics/analytics";
import GroupListHeader from "@/components/group/GroupListHeader";

const GroupListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fetchGroupListByUserId = useBaseStore(
    (state) => state.fetchGroupListByUserId
  );
  const groupList = useBaseStore((state) => state.groupList);
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const setTargetGroup = useBaseStore((state) => state.setTargetGroup);

  useEffect(() => {
    if (user) fetchGroupListByUserId(user.id);
    setTargetGroup(null);
  }, [fetchGroupListByUserId, user, setTargetGroup]);

  if (!groupList) return null;

  const addGroup = () => {
    analyticsTrack("클릭_그룹_추가", {});
    navigate("/group/new");
  };

  const handleGroupClick = (id: string) => {
    analyticsTrack("클릭_그룹_전환", { group_id: id });
    window.location.href = `/group/${id}`;
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 기존 header 및 title 영역 그대로 유지 */}
      <GroupListHeader userGroupList={groupList} />

      {/* 리스트뷰 영역 - GroupListDrawer의 UI 스타일 적용 */}
      <div className="flex-1 overflow-y-auto px-5">
        {groupList.length === 0 ? (
          <div className="p-4 text-center">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              그룹이 없습니다
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              새로운 그룹을 만들어 기도제목 나눔을 시작하세요
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {groupList.map((group) => {
              return (
                <li
                  key={group.id}
                  className="cursor-pointer py-3 hover:bg-gray-100 rounded-lg truncate flex justify-between items-center"
                  onClick={() => handleGroupClick(group.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      {group?.name?.[0]}
                    </div>
                    <div>
                      <div className="font-medium">{group.name}</div>
                      {group.user_id === user?.id ? (
                        <div className="text-sm text-mainBtn">그룹장</div>
                      ) : (
                        <div className="text-sm text-gray-500">그룹원</div>
                      )}
                    </div>
                  </div>
                  {targetGroup?.id === group.id && (
                    <span className="text-blue-500">
                      <FaCircleCheck size={20} />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 하단 액션 버튼 영역 */}
      <div className="p-4 border-t space-y-2">
        <Button
          variant="primary"
          onClick={addGroup}
          className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
        >
          <PlusCircle className="h-5 w-5 mr-2" /> 새 그룹 만들기
        </Button>
      </div>
    </div>
  );
};

export default GroupListPage;
