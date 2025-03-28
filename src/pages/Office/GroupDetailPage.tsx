import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { groupController } from "@/apis/office/groupController";
import { memberController } from "@/apis/office/memberController";
import { prayCardController } from "@/apis/office/prayCardController";
import {
  MemberWithProfiles,
  PrayCardWithProfiles,
  GroupWithProfiles,
} from "supabase/types/tables";
import { getISOTodayDate } from "@/lib/utils";
import { prayController } from "@/apis/office/prayController";
import useAuth from "@/hooks/useAuth";
import { groupUnionController } from "@/apis/office/groupUnionController";

// 멤버별 콘텐츠를 합치기 위한 인터페이스
interface MemberContent {
  memberId: string;
  memberName: string;
  isGroupLeader: boolean;
  prayCards: PrayCardWithProfiles[];
}

interface PrayerStats {
  todayPrayCount: number;
  weeklyPrayCardCount: number;
  totalPrayCount: number;
}

const GroupDetailPage: React.FC = () => {
  const { groupId, unionId } = useParams<{
    groupId: string;
    unionId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState<GroupWithProfiles | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupLeader, setGroupLeader] = useState("");
  const [members, setMembers] = useState<MemberWithProfiles[]>([]);
  const [memberContents, setMemberContents] = useState<MemberContent[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [unionName, setUnionName] = useState("");

  const [prayerStats, setPrayerStats] = useState<PrayerStats>({
    todayPrayCount: 0,
    weeklyPrayCardCount: 0,
    totalPrayCount: 0,
  });

  // 멤버별 콘텐츠 로딩 상태 추적
  const [memberLoadingStates, setMemberLoadingStates] = useState<
    Record<string, boolean>
  >({});

  // 어떤 멤버의 카드가 펼쳐져 있는지 추적하는 상태
  const [expandedMembers, setExpandedMembers] = useState<
    Record<string, boolean>
  >({});

  // 멤버가 그룹장인지 확인하는 함수
  const isGroupLeader = (member: MemberWithProfiles): boolean => {
    if (!groupData || !groupData.user_id || !member.user_id) return false;
    return groupData.user_id === member.user_id;
  };

  // 날짜 포맷 함수 - 시간 제외하고 날짜만 표시
  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    // YYYY-MM-DD 형식으로 변환
    return dateString.split("T")[0];
  };

  // 그룹 정보 및 멤버 목록 로드
  useEffect(() => {
    const fetchGroupData = async () => {
      if (!groupId || !unionId || !user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 1. 공동체(Union) 정보 조회 및 권한 확인
        const unionDetails = await groupUnionController.getGroupUnion(unionId);
        if (!unionDetails) {
          setLoading(false);
          return;
        }

        // 권한 검사: 로그인한 사용자가 공동체 생성자인지 확인
        if (unionDetails.user_id === user.id) {
          setIsAuthorized(true);
          setUnionName(unionDetails.name || "");

          // 권한이 있으면 나머지 데이터 로드
          // 그룹 기본 정보 조회
          const group = await groupController.getGroup(groupId);
          if (group) {
            setGroupData(group);
            setGroupName(group.name || "");
            setGroupLeader(group.profiles?.full_name || "");
          }

          // 그룹 멤버 목록 조회
          const membersData = await memberController.getGroupMembers(groupId);
          if (membersData) {
            setMembers(membersData);
          }

          // 그룹 통계 정보 조회
          const weekDay = new Date().getDay();
          const today = getISOTodayDate();
          const tomorrow = getISOTodayDate(1);
          const sunday = getISOTodayDate(-weekDay);
          const nextSunday = getISOTodayDate(7 - weekDay);
          const todayPrayCount = await prayController.getPrayCountByGroupIds(
            [groupId],
            today,
            tomorrow
          );
          const weekPrayCardCount =
            await prayCardController.getPrayCardCountByGroupIds(
              [groupId],
              sunday,
              nextSunday
            );
          const totalPrayCount = await prayController.getPrayCountByGroupIds([
            groupId,
          ]);

          setPrayerStats({
            todayPrayCount: todayPrayCount,
            weeklyPrayCardCount: weekPrayCardCount,
            totalPrayCount: totalPrayCount,
          });
        } else {
          // 권한이 없는 경우
          setIsAuthorized(false);
          setUnionName(unionDetails.name || "");
        }
      } catch (error) {
        console.error("그룹 데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId, unionId, user]);

  // 멤버 펼치기/접기 처리 함수 (멤버별 콘텐츠 로드 포함)
  const toggleMemberExpand = async (memberId: string) => {
    // 현재 스크롤 위치 저장
    const scrollPosition = window.scrollY;

    // 현재 확장 상태 확인
    const isCurrentlyExpanded = !!expandedMembers[memberId];

    // 확장 상태 토글
    setExpandedMembers((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));

    // 멤버를 확장할 때만 콘텐츠 로드
    if (!isCurrentlyExpanded) {
      // 이미 로드된 콘텐츠가 있는지 확인
      const existingContent = memberContents.find(
        (content) => content.memberId === memberId
      );

      // 콘텐츠가 없으면 API 호출하여 로드
      if (!existingContent) {
        setMemberLoadingStates((prev) => ({ ...prev, [memberId]: true }));

        try {
          // 멤버 정보 찾기
          const member = members.find((m) => m.id === memberId);

          if (member && member.user_id && groupId) {
            // 멤버의 기도 카드 데이터 로드 - prayCardController 사용
            const memberPrayCards =
              await prayCardController.getPrayCardsByUserAndGroup(
                member.user_id,
                groupId
              );

            if (memberPrayCards) {
              // 기도 카드 필터링 - 내용이 있는 카드만 필터링
              const filteredPrayCards = memberPrayCards.filter(
                (card: PrayCardWithProfiles) => card.content || card.life
              );

              // 멤버 콘텐츠 저장
              setMemberContents((prev) => [
                ...prev,
                {
                  memberId,
                  memberName: member.profiles?.full_name || "이름 없음",
                  isGroupLeader: isGroupLeader(member),
                  prayCards: filteredPrayCards,
                },
              ]);
            }
          }
        } catch (error) {
          console.error(`멤버 ${memberId} 데이터 로드 실패:`, error);
        } finally {
          setMemberLoadingStates((prev) => ({ ...prev, [memberId]: false }));
        }
      }
    }

    // 스크롤 위치 복원
    setTimeout(() => {
      window.scrollTo({
        top: scrollPosition,
        behavior: "auto",
      });
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Skeleton for sticky header */}
        <div className="bg-green-600 sticky top-0 z-10">
          <div className="px-4 py-5 flex items-center">
            <div className="h-6 w-6 bg-green-400 rounded-md animate-pulse"></div>
            <div className="h-7 w-36 bg-green-400 rounded-md animate-pulse ml-4"></div>
          </div>
        </div>

        {/* Skeleton for group info */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto p-4">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gray-200 rounded-lg animate-pulse mr-4"></div>
              <div>
                <div className="h-6 w-40 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                <div className="h-5 w-48 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton for group stats */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Skeleton section title */}
          <div className="h-7 w-28 bg-gray-200 rounded-md animate-pulse mb-4"></div>

          {/* Skeleton for stats card */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <div className="h-5 w-28 mx-auto bg-gray-200 rounded-md animate-pulse mb-2"></div>
                  <div className="h-8 w-16 mx-auto bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton for member section */}
          <div className="mt-6">
            <div className="h-7 w-32 bg-gray-200 rounded-md animate-pulse mb-4"></div>

            {/* Skeleton for member list */}
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 animate-pulse mr-3"></div>
                      <div>
                        <div className="h-5 w-28 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-5 w-5 bg-gray-200 rounded-md animate-pulse"></div>
                  </div>

                  {/* Skeleton for prayer cards (shown for the first member) */}
                  {i === 1 && (
                    <div className="border-t border-gray-200 p-4">
                      <div className="space-y-4">
                        {[1, 2].map((j) => (
                          <div
                            key={j}
                            className="bg-white p-4 rounded-lg border border-gray-200"
                          >
                            {/* Skeleton for prayer card content */}
                            <div className="mb-3">
                              <div className="h-5 w-20 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                              <div className="pl-3 border-l-2 border-green-200">
                                <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse mb-1"></div>
                                <div className="h-4 w-3/4 bg-gray-200 rounded-md animate-pulse"></div>
                              </div>
                            </div>

                            <div>
                              <div className="h-5 w-20 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                              <div className="pl-3 border-l-2 border-green-200">
                                <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse mb-1"></div>
                                <div className="h-4 w-5/6 bg-gray-200 rounded-md animate-pulse mb-1"></div>
                                <div className="h-4 w-4/6 bg-gray-200 rounded-md animate-pulse"></div>
                              </div>
                            </div>

                            {/* Skeleton for date */}
                            <div className="flex items-center mt-3">
                              <div className="h-3 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                              <div className="mx-2 h-3 w-3 bg-gray-200 rounded-full animate-pulse"></div>
                              <div className="h-3 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 권한 없음 화면 표시
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          접근 권한이 없습니다
        </h2>
        <p className="text-gray-600 mb-2">
          {unionName} 공동체의 관리자만 이 페이지에 접근할 수 있습니다.
        </p>
        <p className="text-gray-500 mb-6">
          공동체 생성자에게 문의하거나 다른 공동체를 선택해주세요.
        </p>
        <button
          onClick={() => navigate("/office/union")}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          공동체 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 - 녹색 배경으로 변경, sticky로 설정 */}
      <div className="bg-green-600 sticky top-0 z-10">
        <div className="px-4 py-5 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white ml-4">{groupName}</h1>
        </div>
      </div>

      {/* 그룹 정보 - 헤더 아래로 이동 */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{groupName}</h2>
              <div className="flex items-center text-sm mt-1">
                <span className="text-gray-600">그룹장: {groupLeader}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 그룹 통계 카드 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 섹션 타이틀 - 그룹현황 */}
        <h2 className="text-lg font-medium text-gray-900 mb-4">그룹현황</h2>

        {/* 그룹 통계 지표 */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                이번 주 기도카드
              </h3>
              <p className="text-2xl font-bold">
                {prayerStats.weeklyPrayCardCount}개
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                오늘 기도 수
              </h3>
              <p className="text-2xl font-bold">
                {prayerStats.todayPrayCount}개
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                누적 기도 수
              </h3>
              <p className="text-2xl font-bold">
                {prayerStats.totalPrayCount}개
              </p>
            </div>
          </div>
        </div>

        {/* 멤버별 콘텐츠 섹션 */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            맴버별 기도카드
          </h2>

          {/* 멤버 리스트 */}
          <div className="space-y-2">
            {members.map((member) => {
              // 해당 멤버의 컨텐츠가 이미 존재하는지 확인
              const existingContent = memberContents.find(
                (content) => content.memberId === member.id
              );
              const isExpanded = !!expandedMembers[member.id];
              const isLoading = !!memberLoadingStates[member.id];
              const memberIsGroupLeader = isGroupLeader(member);

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200"
                >
                  {/* 멤버 헤더 - 클릭 시 드롭다운 토글 */}
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleMemberExpand(member.id)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <span className="text-green-700 font-medium">
                          {(member.profiles?.full_name || "").substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-gray-900">
                          {member.profiles?.full_name || "이름 없음"}
                        </h3>
                        <span
                          className={`text-xs inline-block px-2 py-0.5 rounded-full ${
                            memberIsGroupLeader
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {memberIsGroupLeader ? "그룹장" : "멤버"}
                        </span>
                      </div>
                    </div>

                    {/* 로딩 아이콘 또는 드롭다운 아이콘 */}
                    {isLoading ? (
                      <div className="animate-spin h-5 w-5 text-blue-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          expandedMembers[member.id] ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </div>

                  {/* 멤버별 기도카드 - 드롭다운 콘텐츠 */}
                  {isExpanded && existingContent && (
                    <div className="border-t border-gray-200 p-4">
                      {/* 기도카드 목록 */}
                      <div className="space-y-4">
                        {existingContent.prayCards.map((prayCard) => (
                          <div
                            key={prayCard.id}
                            className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm"
                          >
                            {/* 일상 나눔 (life 필드) */}
                            {prayCard.life && (
                              <div className="mb-3">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                  일상 나눔
                                </h4>
                                <div className="pl-3 border-l-2 border-green-200">
                                  <p className="text-sm text-gray-700">
                                    {prayCard.life}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* 기도 제목 (content 필드) */}
                            {prayCard.content && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                  기도 제목
                                </h4>
                                <div className="pl-3 border-l-2 border-green-200">
                                  <p className="text-sm text-gray-700">
                                    {prayCard.content}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* 날짜 및 함께 기도 정보 - 날짜를 YYYY-MM-DD 형식으로 변환 */}
                            <div className="flex items-center mt-3 text-xs text-gray-500">
                              <span>{formatDate(prayCard.created_at)}</span>
                              <span className="mx-2 text-gray-400">•</span>
                              <span>
                                {prayCard.pray?.length || 0}명과 함께 기도
                              </span>
                            </div>
                          </div>
                        ))}

                        {/* 기도카드가 없는 경우 */}
                        {existingContent.prayCards.length === 0 && (
                          <div className="text-center py-4 text-gray-500">
                            아직 작성된 기도카드가 없습니다.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailPage;
