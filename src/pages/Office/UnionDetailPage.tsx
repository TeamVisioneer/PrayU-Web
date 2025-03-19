import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useOfficeStore from "@/stores/officeStore";
import { groupUnionController } from "@/apis/office/groupUnionController";
import { groupController } from "@/apis/office/groupController";
import { GroupUnion, GroupWithProfiles } from "../../../supabase/types/tables";
import {
  getPrayerStatsForGroups,
  getDailyPrayerCountsForLastWeek,
  DailyPrayerCount,
} from "@/utils/prayUtils";

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
  todayCount: number;
  weeklyCount: number;
  monthlyCount: number;
  totalCount: number;
}

const UnionDetailPage: React.FC = () => {
  const { unionId } = useParams<{ unionId: string }>();
  const navigate = useNavigate();
  const { myUnions } = useOfficeStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [unionData, setUnionData] = useState<GroupUnion | null>(null); // API로 가져온 공동체 상세 정보
  const [loading, setLoading] = useState(true);
  const [prayerStats, setPrayerStats] = useState<PrayerStats>({
    todayCount: 0,
    weeklyCount: 0,
    monthlyCount: 0,
    totalCount: 0,
  });
  // 멤버 데이터는 사용되지 않지만 향후 멤버 탭 구현을 위해 유지
  const [groupsData, setGroupsData] = useState<GroupWithProfiles[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "members" | "prayers" | "groups"
  >("overview");
  const [showUnionDropdown, setShowUnionDropdown] = useState(false);
  const [dailyPrayerCounts, setDailyPrayerCounts] = useState<
    DailyPrayerCount[]
  >([]);

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
      if (!unionId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 1. 공동체 기본 정보 가져오기 (구현한 API 호출)
        const unionDetails = await groupUnionController.getGroupUnion(unionId);
        const groups = await groupController.fetchGroupListByUnionId(unionId);

        if (!unionDetails || !groups) {
          setLoading(false);
          return;
        }

        setUnionData(unionDetails);
        setGroupsData(groups);

        // 2. 실제 기도 통계 데이터 가져오기
        const groupIds = groups.map((group) => group.id);

        // 2.1 기본 기도 통계 가져오기
        const stats = await getPrayerStatsForGroups(groupIds);
        if (stats) {
          setPrayerStats(stats);
        } else {
          // 기도 통계 가져오기 실패 시 기본값 유지
          console.error("Failed to fetch prayer statistics");
        }

        // 2.2 일간 기도 활동 데이터 가져오기
        const dailyCounts = await getDailyPrayerCountsForLastWeek(groupIds);
        if (dailyCounts) {
          setDailyPrayerCounts(dailyCounts);
        } else {
          console.error("Failed to fetch daily prayer counts");
        }
      } catch (error) {
        console.error("Error fetching union details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnionAndGroups();
  }, [unionId]);

  // 공동체 선택 처리
  const handleUnionSelect = (unionId: string) => {
    setShowUnionDropdown(false);
    navigate(`/office/union/${unionId}`);
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

  // 기도 통계 계산을 위한 멤버 수 기본값 설정
  const memberCount = 10;

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
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                개요
              </button>
              <button
                onClick={() => setActiveTab("groups")}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === "groups"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                그룹 ({groupsData.length}개)
              </button>
              {/* 탭 메뉴 유지 */}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              공동체 현황
            </h2>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              <div
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all hover:border-blue-300"
                onClick={() => setActiveTab("groups")}
              >
                <h3 className="text-sm font-medium text-gray-500 mb-1">그룹</h3>
                <p className="text-2xl font-bold">{groupsData.length}개</p>
                <div className="mt-2 text-sm text-gray-600">
                  <p>함께 기도하는 그룹</p>
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

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
                <div className="md:mb-0 md:flex-1 md:border-r md:border-gray-200 md:pr-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    오늘 기도
                  </h3>
                  <p className="text-xl md:text-2xl font-bold">
                    {prayerStats.todayCount}개
                  </p>
                  <div className="mt-1 text-xs md:text-sm text-blue-600">
                    <p>
                      전체의{" "}
                      {Math.round((prayerStats.todayCount / memberCount) * 100)}
                      % 참여
                    </p>
                  </div>
                </div>

                <div className="">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    이번 주 기도
                  </h3>
                  <p className="text-xl md:text-2xl font-bold">
                    {prayerStats.weeklyCount}개
                  </p>
                  <div className="mt-1 text-xs md:text-sm text-green-600">
                    <p>전주 대비 {Math.floor(Math.random() * 30) + 5}% 증가</p>
                  </div>
                </div>

                <div className="md:flex-1 md:pl-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    누적 기도
                  </h3>
                  <p className="text-xl md:text-2xl font-bold">
                    {prayerStats.totalCount}개
                  </p>
                  <div className="mt-1 text-xs md:text-sm text-gray-600">
                    <p>
                      멤버당 평균{" "}
                      {Math.round(prayerStats.totalCount / memberCount)}개
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
                  {dailyPrayerCounts.map((dayData, i) => {
                    // 실제 높이(픽셀)를 계산 (최소 10px, 최대 180px)
                    // 기도 수 0개일 경우 10px, 최대치는 현재 최대값의 비율로 계산
                    const maxCount = Math.max(
                      ...dailyPrayerCounts.map((d) => d.count),
                      1
                    ); // 0으로 나누기 방지
                    const scaleFactor = 170; // 최대 높이 170px

                    // 0일 경우 최소 높이인 10px, 그렇지 않으면 비율에 따라 높이 계산
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
                  })}
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

              {/* 나머지 통계 카드 유지 */}
              {/* <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  최근 활동
                </h3>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <span className="text-gray-600 font-medium">{`멤${
                          i + 1
                        }`}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {`멤버 ${i + 1}`}님이 기도카드를 등록했습니다.
                        </p>
                        <p className="text-xs text-gray-500">{`${Math.floor(
                          i * 3.5
                        )} 시간 전`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}
              {/* 
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  인기 기도 주제
                </h3>
                <div className="space-y-3">
                  {[
                    "교회와 성도를 위한 기도",
                    "가정을 위한 기도",
                    "직장과 사업을 위한 기도",
                    "건강을 위한 기도",
                    "선교지를 위한 기도",
                  ].map((topic, i) => (
                    <div key={i} className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-600 font-medium">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{topic}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${90 - i * 15}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 ml-3">
                        {90 - i * 15}%
                      </span>
                    </div>
                  ))}
                </div>
              </div> */}
            </div>
          </div>
        )}

        {activeTab === "groups" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">그룹 목록</h2>
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                공동체로 초대하기
              </button>
            </div>

            {/* 그룹 목록 - 새로운, 더 단순한 UI */}
            <div>
              {groupsData.length > 0 ? (
                groupsData.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white border border-gray-200 rounded mb-3"
                  >
                    <div className="p-4">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {group.name || "이름 없음"}
                          </h3>
                          {/* <p className="text-sm text-gray-600 mb-2">
                            {group.intro || "그룹 설명이 없습니다."}
                          </p> */}
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
                  <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() =>
                      navigate(`/office/union/${unionId}/group/new`)
                    }
                  >
                    새 그룹 만들기
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 다른 탭 컨텐츠는 유지 */}
      </div>
    </div>
  );
};

export default UnionDetailPage;
