import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, CheckCircle2 } from "lucide-react";
import useAuth from "../hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import { Button } from "@/components/ui/button";
import { analyticsTrack } from "@/analytics/analytics";
import GroupListHeader from "@/components/group/GroupListHeader";
import GroupListDrawer from "@/components/group/GroupListDrawer";
import { Skeleton } from "@/components/ui/skeleton";

const GroupListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fetchGroupListByUserId = useBaseStore(
    (state) => state.fetchGroupListByUserId
  );
  const groupList = useBaseStore((state) => state.groupList);

  useEffect(() => {
    if (user) fetchGroupListByUserId(user.id);
  }, [fetchGroupListByUserId, user]);

  const addGroup = () => {
    analyticsTrack("클릭_그룹_추가", {});
    navigate("/group/new");
  };

  const handleGroupClick = (id: string) => {
    analyticsTrack("클릭_그룹_전환", { group_id: id });
    window.location.href = `/group/${id}`;
  };

  if (!groupList) {
    return (
      <div className="flex flex-col h-screen">
        <GroupListHeader />
        <div className="p-5 flex-grow overflow-y-auto">
          {[...Array(3)].map((_, index) => (
            <Skeleton
              key={index}
              className="cursor-pointer py-3  rounded-lg truncate flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div>
                  <Skeleton className="w-24 h-5 bg-gray-200 mb-1" />
                  <Skeleton className="w-16 h-4 bg-gray-200" />
                </div>
              </div>
            </Skeleton>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen relative">
      <GroupListHeader />

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
                  className="cursor-pointer py-3 rounded-lg truncate flex justify-between items-center"
                  onClick={() => handleGroupClick(group.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      {group?.name ? [...group.name][0] : ""}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {group.name}
                        {group.group_union_id && (
                          <CheckCircle2
                            className="h-4 w-4 text-blue-500"
                            aria-label="인증된 그룹"
                          />
                        )}
                      </div>
                      {group.user_id === user?.id ? (
                        <div className="text-sm text-mainBtn">그룹장</div>
                      ) : (
                        <div className="text-sm text-gray-500">그룹원</div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 플로팅 버튼 */}
      <Button
        variant="primary"
        onClick={addGroup}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center p-0 z-10"
        aria-label="새 그룹 만들기"
      >
        <PlusCircle className="h-6 w-6" />
      </Button>

      <GroupListDrawer />
    </div>
  );
};

export default GroupListPage;
