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

// 스크롤바 숨기기 스타일
const hideScrollbarStyle = `
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;  /* Chrome, Safari, Opera */
  }
`;

// 멤버별 콘텐츠를 합치기 위한 인터페이스
interface MemberContent {
  memberId: string;
  memberName: string;
  isGroupLeader: boolean;
  prayCards: PrayCardWithProfiles[];
}

interface PrayerStats {
  todayCount: number;
  weeklyCount: number;
  totalCount: number;
}

const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string; unionId: string }>();
  // URL에 unionId도 포함되어 있지만 현재 컴포넌트에서는 사용하지 않음
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState<GroupWithProfiles | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupLeader, setGroupLeader] = useState("");
  const [members, setMembers] = useState<MemberWithProfiles[]>([]);
  const [memberContents, setMemberContents] = useState<MemberContent[]>([]);

  const [prayerStats, setPrayerStats] = useState<PrayerStats>({
    todayCount: 0,
    weeklyCount: 0,
    totalCount: 0,
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
      if (!groupId) return;

      setLoading(true);
      try {
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
        const weekPrayCount = await prayController.getPrayCountByGroupIds(
          [groupId],
          sunday,
          nextSunday
        );
        const totalPrayCount = await prayController.getPrayCountByGroupIds([
          groupId,
        ]);

        setPrayerStats({
          todayCount: todayPrayCount,
          weeklyCount: weekPrayCount,
          totalCount: totalPrayCount,
        });
      } catch (error) {
        console.error("그룹 데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId]);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* CSS for hiding scrollbars */}
      <style>{hideScrollbarStyle}</style>

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

        {/* 그룹 통계 지표 - 3개 지표를 가로로 배치 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                오늘 기도
              </h3>
              <p className="text-xl md:text-2xl font-bold">
                {prayerStats.todayCount}개
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                이번 주 기도
              </h3>
              <p className="text-xl md:text-2xl font-bold">
                {prayerStats.weeklyCount}개
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                누적 기도
              </h3>
              <p className="text-xl md:text-2xl font-bold">
                {prayerStats.totalCount}개
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
