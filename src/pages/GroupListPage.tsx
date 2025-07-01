import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Crown, Calendar, Users } from "lucide-react";
import useAuth from "../hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { analyticsTrack } from "@/analytics/analytics";
import GroupListHeader from "@/components/group/GroupListHeader";
import GroupListDrawer from "@/components/group/GroupListDrawer";
import { Skeleton } from "@/components/ui/skeleton";

const GroupListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fetchMemberListByUserId = useBaseStore(
    (state) => state.fetchMemberListByUserId
  );
  const fetchGroupListByGroupIds = useBaseStore(
    (state) => state.fetchGroupListByGroupIds
  );
  const groupList = useBaseStore((state) => state.groupList);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const myMemberList = await fetchMemberListByUserId(user.id);
      if (!myMemberList) return;
      const groupListIds = myMemberList
        .map((member) => member.group_id)
        .filter((group_id) => group_id !== null) as string[];
      await fetchGroupListByGroupIds(groupListIds);
    };
    fetchData();
  }, [fetchMemberListByUserId, fetchGroupListByGroupIds, user]);

  const formatDaysSince = (dateString: string) => {
    const createdDate = new Date(dateString);
    const today = new Date();

    // 년, 월, 일 차이 계산
    const yearDiff = today.getFullYear() - createdDate.getFullYear();
    const monthDiff = today.getMonth() - createdDate.getMonth();
    const dayDiff = today.getDate() - createdDate.getDate();

    // 총 개월 수 계산
    const totalMonths = yearDiff * 12 + monthDiff + (dayDiff >= 0 ? 0 : -1);

    // 총 일수 계산
    const diffTime = today.getTime() - createdDate.getTime();
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (yearDiff >= 1) {
      return `기도 ${yearDiff}년차`;
    } else if (totalMonths >= 1) {
      return `기도 ${totalMonths}달차`;
    } else {
      return `기도 ${totalDays}일차`;
    }
  };

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
        <div className="p-5 flex-grow overflow-y-auto space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <Skeleton className="w-32 h-6 bg-gray-200 mb-2" />
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Skeleton className="w-20 h-4 bg-gray-200" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center">
                    {[...Array(3)].map((_, idx) => (
                      <Skeleton
                        key={idx}
                        className={`w-8 h-8 bg-gray-200 rounded-full border-2 border-white ${
                          idx > 0 ? "-ml-2" : ""
                        }`}
                      />
                    ))}
                  </div>
                  <Skeleton className="w-12 h-4 bg-gray-200" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="w-12 h-4 bg-gray-200" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen relative overflow-x-hidden">
      <GroupListHeader />

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4">
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
          <div className="space-y-4">
            {groupList.map((group) => {
              const maxVisibleAvatars = 4;
              const memberAvatars = group.member?.slice(0, maxVisibleAvatars);
              const remainingCount = Math.max(
                0,
                (group.member?.length || 0) - maxVisibleAvatars
              );

              return (
                <Card
                  key={group.id}
                  className="transition-all duration-200 cursor-pointer hover:scale-[1.02] border-0 bg-white shadow-none overflow-hidden"
                  onClick={() => handleGroupClick(group.id)}
                >
                  <CardContent className="p-4">
                    <div className="w-full min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0 mr-2">
                          <h3 className="font-semibold text-lg text-gray-900 truncate">
                            {group.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 overflow-hidden">
                            <span className="flex items-center gap-1 shrink-0">
                              <Crown className="w-3 h-3" />
                              <span className="truncate">
                                {group.profiles?.full_name || "그룹장"}
                              </span>
                            </span>
                            <span className="shrink-0">•</span>
                            <span className="flex items-center gap-1 shrink-0">
                              <Calendar className="w-3 h-3" />
                              {formatDaysSince(group.created_at)}
                            </span>
                          </div>
                        </div>

                        {group.group_union_id && (
                          <Badge
                            variant="secondary"
                            className="shrink-0 bg-blue-50 text-blue-700 border-blue-200"
                          >
                            연합
                          </Badge>
                        )}
                      </div>

                      {/* 멤버 아바타들 */}
                      <div className="flex items-center gap-3 mb-3 overflow-hidden">
                        <div className="flex items-center max-w-[180px] overflow-hidden">
                          {memberAvatars?.map((member, index) => (
                            <Avatar
                              key={member.id}
                              className={`w-8 h-8 border-2 border-white shrink-0 ${
                                index > 0 ? "-ml-2" : ""
                              }`}
                              style={{
                                zIndex: (memberAvatars?.length || 0) - index,
                              }}
                            >
                              <AvatarImage
                                src={
                                  member.profiles?.avatar_url ||
                                  "/images/defaultProfileImage.png"
                                }
                                alt={member.profiles?.full_name || undefined}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white text-xs">
                                {member.profiles?.full_name?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {remainingCount > 0 && (
                            <div className="w-8 h-8 -ml-2 bg-gray-100 border-2 border-white rounded-full flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">
                              +{remainingCount}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-sm text-gray-500 shrink-0">
                          <Users className="w-4 h-4" />
                          <span>{group.member?.length || 0}명</span>
                        </div>
                      </div>

                      {/* 현재 사용자 역할 표시 */}
                      <div className="mt-2">
                        {group.user_id === user?.id ? (
                          <div className="text-xs text-mainBtn font-medium">
                            그룹장
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">그룹원</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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
