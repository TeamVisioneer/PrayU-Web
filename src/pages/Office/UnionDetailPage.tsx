import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useOfficeStore from "@/stores/officeStore";
import { groupUnionController } from "@/apis/office/groupUnionController";
import { groupController } from "@/apis/office/groupController";
import {
  GroupUnion,
  GroupWithProfiles,
  Pray,
} from "../../../supabase/types/tables";
import { prayController } from "@/apis/office/prayController";
import { getISOTodayDate } from "@/lib/utils";
import { prayCardController } from "@/apis/office/prayCardController";
import useAuth from "@/hooks/useAuth";
import { UnionInviteLink } from "@/components/share/KakaoShareBtn";

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

// 목데이터: 실제로는 API로 대체될 데이터
interface PrayerStats {
  todayPrayCount: number;
  weeklyPrayCardCount: number;
  totalPrayCount: number;
}

const UnionDetailPage: React.FC = () => {
  const { unionId } = useParams<{ unionId: string }>();
  const navigate = useNavigate();
  const { myUnions } = useOfficeStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const groupListRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const [unionData, setUnionData] = useState<GroupUnion | null>(null); // API로 가져온 공동체 상세 정보
  const [loading, setLoading] = useState(true);
  const [prayerStats, setPrayerStats] = useState<PrayerStats>({
    todayPrayCount: 0,
    weeklyPrayCardCount: 0,
    totalPrayCount: 0,
  });
  // 멤버 데이터는 사용되지 않지만 향후 멤버 탭 구현을 위해 유지
  const [groupsData, setGroupsData] = useState<GroupWithProfiles[]>([]);
  const [prayData, setPrayData] = useState<Pray[]>([]);
  const [showUnionDropdown, setShowUnionDropdown] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const scrollToGroupList = () => {
    if (groupListRef.current) {
      groupListRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowUnionDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 페이지 로드 시 공동체 정보와 그룹 목록 가져오기
  useEffect(() => {
    const fetchUnionAndGroups = async () => {
      if (!unionId || !user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 1. 공동체 기본 정보 가져오기 (구현한 API 호출)
        const unionDetails = await groupUnionController.getGroupUnion(unionId);

        if (!unionDetails) {
          setLoading(false);
          return;
        }

        // 권한 검사: 로그인한 사용자가 공동체 생성자인지 확인
        if (unionDetails.user_id === user.id) {
          setIsAuthorized(true);

          // 권한이 있으면 나머지 데이터 로드
          const groups = await groupController.fetchGroupListByUnionId(unionId);

          if (!groups) {
            setLoading(false);
            return;
          }

          const weekDay = new Date().getDay();
          const today = getISOTodayDate();
          const tomorrow = getISOTodayDate(1);
          const sunday = getISOTodayDate(-weekDay);
          const nextSunday = getISOTodayDate(7 - weekDay);
          const sevenDaysAgo = getISOTodayDate(-7);

          const groupIds = groups.map((group) => group.id);
          const todayPrayCount = await prayController.getPrayCountByGroupIds(
            groupIds,
            today,
            tomorrow
          );
          const weekPrayCardCount =
            await prayCardController.getPrayCardCountByGroupIds(
              groupIds,
              sunday,
              nextSunday
            );
          const totalPrayCount = await prayController.getPrayCountByGroupIds(
            groupIds
          );
          const prayData = await prayController.getPrayDataByGroupIds(
            groupIds,
            sevenDaysAgo,
            tomorrow
          );

          setUnionData(unionDetails);
          setGroupsData(groups);
          setPrayData(prayData);
          setPrayerStats({
            todayPrayCount: todayPrayCount,
            weeklyPrayCardCount: weekPrayCardCount,
            totalPrayCount: totalPrayCount,
          });
        } else {
          // 권한이 없는 경우
          setUnionData(unionDetails); // 접근 제한 메시지에서 공동체 이름 표시를 위해 데이터 설정
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Error fetching union details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnionAndGroups();
  }, [unionId, user]);

  // 공동체 선택 처리
  const handleUnionSelect = (unionId: string) => {
    setShowUnionDropdown(false);
    navigate(`/office/union/${unionId}`);
  };

  // Generate invitation link
  const generateInviteLink = () => {
    if (!unionId) return "";
    return `${window.location.origin}/office/union/${unionId}/join`;
  };

  // Handle copy link
  const handleCopyLink = async () => {
    const link = generateInviteLink();
    try {
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleShareKakao = () => {
    const kakaoLinkObject = UnionInviteLink(
      unionData?.name || "",
      unionId || ""
    );
    window.Kakao.Share.sendDefault(kakaoLinkObject);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!unionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          공동체를 찾을 수 없습니다
        </h2>
        <p className="text-gray-600 mb-6">
          요청하신 공동체 정보를 찾을 수 없습니다. 다른 공동체를 선택해주세요.
        </p>
        <button
          onClick={() => navigate("/office/union")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          공동체 목록으로 돌아가기
        </button>
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
          {unionData.name} 공동체의 관리자만 이 페이지에 접근할 수 있습니다.
        </p>
        <p className="text-gray-500 mb-6">
          공동체 생성자에게 문의하거나 다른 공동체를 선택해주세요.
        </p>
        <button
          onClick={() => navigate("/office/union")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          공동체 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* CSS for hiding scrollbars */}
      <style>{hideScrollbarStyle}</style>

      {/* 상단 고정 영역 */}
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        {/* 상단 헤더 */}
        <div className="border-b border-gray-200 p-3 flex items-center justify-between">
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setShowUnionDropdown(!showUnionDropdown)}
              className="flex items-center text-gray-800 hover:text-blue-600 transition-colors"
            >
              <h2 className="text-lg font-bold">
                {unionData.name || "공동체"}
              </h2>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ml-1 transition-transform ${
                  showUnionDropdown ? "rotate-180" : ""
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
            </button>

            {/* 공동체 드롭다운 메뉴 */}
            {showUnionDropdown && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg z-40 max-h-[calc(100vh-120px)] overflow-y-auto">
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center mb-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center mr-3 bg-blue-100 text-blue-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
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
                      <h4 className="font-medium text-gray-900">
                        현재: {unionData.name || "공동체"}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {unionData.church || "교회 정보 없음"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-1 px-3 pt-2">
                  <h3 className="text-xs uppercase font-semibold text-gray-500 mb-1">
                    다른 공동체
                  </h3>
                </div>

                {myUnions
                  .filter((c) => c.id !== unionData.id)
                  .map((otherUnion) => (
                    <button
                      key={otherUnion.id}
                      onClick={() => handleUnionSelect(otherUnion.id)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center mr-2 bg-blue-100 text-blue-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
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
                      <span className="truncate">{otherUnion.name}</span>
                    </button>
                  ))}

                <div className="py-2 px-3 border-t border-gray-100 mt-2">
                  <button
                    onClick={() => navigate("/office/union")}
                    className="w-full text-left px-2 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    공동체 목록으로 돌아가기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 공동체 정보 */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center mr-4 bg-blue-100 text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
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
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900 mr-3">
                    {unionData.name || "공동체"}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center text-sm mt-1">
                  <span className="font-medium text-gray-700">
                    {unionData.church || "교회 정보 없음"}
                  </span>
                  {unionData.intro && (
                    <>
                      <span className="mx-1.5 text-gray-400">•</span>
                      <span className="text-gray-600">{unionData.intro}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto hide-scrollbar">
              <h2 className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm whitespace-nowrap">
                공동체 현황
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div>
          {/* 중타이틀 */}
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            공동체 현황
          </h2>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            <div
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all hover:border-blue-300"
              onClick={scrollToGroupList}
            >
              <h3 className="text-sm font-medium text-gray-500 mb-1">그룹</h3>
              <p className="text-2xl font-bold">{groupsData.length}개</p>
              <div className="mt-2 text-sm text-gray-600">
                <p className="truncate">
                  {groupsData.length > 0
                    ? groupsData.map((group) => group.name).join(", ")
                    : "등록된 그룹이 없습니다"}
                </p>
              </div>
              <div className="mt-3 text-blue-600 text-sm flex items-center justify-start">
                <span>그룹 목록 보기</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center ">
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

            {/* 활동 요약 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-md font-medium text-gray-900 mb-4">
                일간 기도 활동
              </h3>
              <div className="h-60 flex items-end space-x-2 mb-10 pt-10">
                {(() => {
                  // 오늘 날짜 기준으로 지난 7일의 날짜 배열 생성
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
                  const days = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date(today);
                    date.setDate(today.getDate() - 6 + i);
                    return {
                      date,
                      dayStr: dayNames[date.getDay()],
                      count: 0,
                      isToday: i === 6,
                    };
                  });

                  // prayData를 날짜별로 그룹화하여 카운트
                  prayData.forEach((pray) => {
                    const prayDate = new Date(pray.created_at);
                    prayDate.setHours(0, 0, 0, 0);

                    const dayIndex = days.findIndex(
                      (day) =>
                        day.date.getFullYear() === prayDate.getFullYear() &&
                        day.date.getMonth() === prayDate.getMonth() &&
                        day.date.getDate() === prayDate.getDate()
                    );

                    if (dayIndex !== -1) {
                      days[dayIndex].count += 1;
                    }
                  });

                  // 최대 기도 수 계산 (0으로 나누기 방지)
                  const maxCount = Math.max(...days.map((d) => d.count), 1);
                  const scaleFactor = 170; // 최대 높이 170px

                  return days.map((dayData, i) => {
                    // 바 높이 계산
                    const barHeight =
                      dayData.count === 0
                        ? 10
                        : 10 +
                          Math.min(
                            Math.floor(
                              (dayData.count / maxCount) * scaleFactor
                            ),
                            scaleFactor
                          );

                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center flex-1 relative"
                      >
                        <div className="relative -top-3 text-center">
                          <span
                            className={`text-xs font-medium ${
                              dayData.count > 0
                                ? "text-gray-700"
                                : "text-gray-400"
                            }`}
                          >
                            {dayData.count}개
                          </span>
                        </div>
                        <div
                          className={`w-full ${
                            dayData.isToday ? "bg-blue-500" : "bg-blue-200"
                          } rounded-t-sm transition-all duration-300`}
                          style={{ height: `${barHeight}px` }}
                        ></div>
                        <div className="text-xs text-gray-500 mt-2 text-center">
                          <div>{dayData.dayStr}</div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
              <div className="text-sm text-gray-500 text-center mt-2">
                <span className="inline-block mr-4">
                  <span className="inline-block w-3 h-3 bg-blue-200 mr-1 rounded-sm"></span>
                  이전 기도 활동
                </span>
                <span className="inline-block">
                  <span className="inline-block w-3 h-3 bg-blue-500 mr-1 rounded-sm"></span>
                  오늘 기도 활동
                </span>
              </div>
            </div>

            {/* 그룹 목록 섹션 */}
            <div ref={groupListRef} className="mt-12">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">그룹 목록</h2>
                <button
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  onClick={() => setShowInviteModal(true)}
                >
                  공동체 그룹 등록
                </button>
              </div>

              {/* 그룹 목록 */}
              <div>
                {groupsData.length > 0 ? (
                  groupsData.map((group) => (
                    <div
                      key={group.id}
                      className="bg-white border border-gray-200 rounded mb-3"
                      onClick={() =>
                        navigate(`/office/union/${unionId}/group/${group.id}`)
                      }
                    >
                      <div className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {group.name || "이름 없음"}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500">
                              <span className="inline-flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                그룹장: {group.profiles?.full_name || "리더 1"}
                              </span>
                            </div>
                          </div>
                          <a
                            href={`/office/union/${unionId}/group/${group.id}`}
                            className="text-blue-600 hover:text-blue-800 self-start flex items-center text-sm"
                          >
                            상세보기
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 ml-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">등록된 그룹이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 초대 모달 */}
      {showInviteModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-center min-h-screen p-4 text-center">
            {/* 배경 오버레이 */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setShowInviteModal(false)}
            ></div>

            {/* 모달 패널 */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full sm:p-6 relative">
              {/* X 버튼 추가 */}
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-500"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="sr-only">닫기</span>
              </button>

              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3
                    className="text-lg leading-6 font-medium text-gray-900"
                    id="modal-title"
                  >
                    공동체 그룹 등록
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      공동체에 등록할 그룹의 그룹장에게 요청 링크를
                      전달해주세요.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 space-y-2 w-full">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm h-[46px] transition-colors duration-200"
                >
                  <div className="flex items-center justify-center w-full transition-all duration-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke={copySuccess ? "currentColor" : "currentColor"}
                    >
                      {copySuccess ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      )}
                    </svg>
                    <span className={`${copySuccess ? "text-green-600" : ""}`}>
                      {copySuccess ? "링크가 복사되었습니다" : "초대링크 복사"}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleShareKakao}
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-3 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:text-sm h-[46px] transition-colors duration-200"
                >
                  <div className="flex items-center justify-center w-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    <span>카카오로 공유하기</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnionDetailPage;
