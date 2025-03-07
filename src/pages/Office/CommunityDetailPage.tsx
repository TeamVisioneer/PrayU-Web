import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useOfficeStore from "@/stores/officeStore";
import { Group } from "@/data/mockOfficeData";

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

interface Member {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  lastActive: string;
  prayCount: number;
  groupName: string;
}

// 그룹 데이터 인터페이스
interface GroupData {
  id: string;
  name: string;
  type: string;
  memberCount: number;
  leaderName: string;
  description: string;
  createdAt: string;
}

const CommunityDetailPage: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { getCommunityById, myCommunities } = useOfficeStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [community, setCommunity] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [prayerStats, setPrayerStats] = useState<PrayerStats>({
    todayCount: 0,
    weeklyCount: 0,
    monthlyCount: 0,
    totalCount: 0,
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "members" | "prayers" | "groups"
  >("overview");
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCommunityDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (communityId) {
      const communityData = getCommunityById(communityId);
      setCommunity(communityData);

      // 목데이터 생성 - 실제로는 API 호출로 대체
      if (communityData) {
        // 기도 통계 목데이터
        setPrayerStats({
          todayCount: Math.floor(Math.random() * 15) + 5,
          weeklyCount: Math.floor(Math.random() * 50) + 20,
          monthlyCount: Math.floor(Math.random() * 200) + 80,
          totalCount: Math.floor(Math.random() * 1000) + 300,
        });

        // 멤버 목데이터
        const mockMembers: Member[] = Array.from(
          { length: communityData.memberCount },
          (_, i) => ({
            id: `member-${i + 1}`,
            name: `멤버 ${i + 1}`,
            role: i === 0 ? "리더" : i < 3 ? "부리더" : "멤버",
            lastActive: new Date(
              Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split("T")[0],
            prayCount: Math.floor(Math.random() * 100) + 10,
            groupName: `${communityData.name} 소그룹 ${
              Math.floor(Math.random() * 5) + 1
            }`,
          })
        );
        setMembers(mockMembers);

        // 그룹 목데이터 생성
        const mockGroups: GroupData[] = Array.from({ length: 5 }, (_, i) => ({
          id: `group-${i + 1}`,
          name: `${communityData.name} 소그룹 ${i + 1}`,
          type: i % 2 === 0 ? "GBS" : "리더모임",
          memberCount: Math.floor(Math.random() * 15) + 3,
          leaderName: `리더 ${i + 1}`,
          description: `${communityData.name}의 ${
            i % 2 === 0 ? "GBS" : "리더모임"
          } 소그룹입니다.`,
          createdAt: new Date(
            Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split("T")[0],
        }));
        setGroups(mockGroups);
      }

      setLoading(false);
    }
  }, [communityId, getCommunityById]);

  // 공동체 선택 처리
  const handleCommunitySelect = (communityId: string) => {
    setShowCommunityDropdown(false);
    navigate(`/office/community/${communityId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          공동체를 찾을 수 없습니다
        </h2>
        <p className="text-gray-600 mb-6">
          요청하신 공동체 정보를 찾을 수 없습니다. 다른 공동체를 선택해주세요.
        </p>
        <button
          onClick={() => navigate("/office")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          공동체 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{hideScrollbarStyle}</style>

      <div className="sticky top-0 z-30 bg-white shadow-sm">
        {/* 상단 헤더 - Office Page 스타일 적용 */}
        <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setShowCommunityDropdown(!showCommunityDropdown)}
              className="flex items-center text-gray-800 hover:text-blue-600 transition-colors"
            >
              <h2 className="text-lg font-bold">{community.name}</h2>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ml-1 transition-transform ${
                  showCommunityDropdown ? "rotate-180" : ""
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
            {showCommunityDropdown && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20 max-h-[calc(100vh-120px)] overflow-y-auto">
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center mb-2">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center mr-3 ${
                        community.groupType === "community"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {community.groupType === "community" ? (
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
                      ) : (
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
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{community.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 pl-11">
                    {community.churchName}
                  </p>
                </div>

                {myCommunities
                  .filter((c) => c.id !== community.id)
                  .map((otherCommunity) => (
                    <button
                      key={otherCommunity.id}
                      onClick={() => handleCommunitySelect(otherCommunity.id)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center mr-2 ${
                          otherCommunity.groupType === "community"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        {otherCommunity.groupType === "community" ? (
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
                        ) : (
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
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="truncate">{otherCommunity.name}</span>
                    </button>
                  ))}

                <div className="py-2 px-3 border-t border-gray-100 mt-2">
                  <button
                    onClick={() => navigate("/office")}
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
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center">
              <div
                className={`flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center mr-4 ${
                  community.groupType === "community"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-purple-100 text-purple-600"
                }`}
              >
                {community.groupType === "community" ? (
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
                ) : (
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                )}
              </div>
              <div>
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900 mr-3">
                    {community.name}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center text-sm mt-1">
                  <span className="font-medium text-gray-700">
                    {community.churchName}
                  </span>
                  {community.description && (
                    <>
                      <span className="mx-1.5 text-gray-400">•</span>
                      <span className="text-gray-600">
                        {community.description}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white border-b border-gray-200">
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
                그룹 ({groups.length}개)
              </button>
              {/* <button
                onClick={() => setActiveTab("members")}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === "members"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                멤버 ({community.memberCount}명)
              </button>
              <button
                onClick={() => setActiveTab("prayers")}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === "prayers"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                기도 기록
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              공동체 현황
            </h2>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              {/* <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-1">멤버</h3>
                <p className="text-2xl font-bold">{community.memberCount}명</p>
                <div className="mt-2 text-sm text-gray-600">
                  {community.pastorName && (
                    <p>담당자: {community.pastorName}</p>
                  )}
                  <p>
                    생성일: {new Date(community.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div> */}

              <div
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all hover:border-blue-300"
                onClick={() => setActiveTab("groups")}
              >
                <h3 className="text-sm font-medium text-gray-500 mb-1">그룹</h3>
                <p className="text-2xl font-bold">{groups.length}개</p>
                <div className="mt-2 text-sm text-gray-600">
                  <p>함께 기도하는 그룹 공동체</p>
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
                      {Math.round(
                        (prayerStats.todayCount / community.memberCount) * 100
                      )}
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
                      {Math.round(
                        prayerStats.totalCount / community.memberCount
                      )}
                      개
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
                  {Array.from({ length: 7 }, (_, i) => {
                    // 실제 높이(픽셀)를 계산 (최소 10px, 최대 180px)
                    const barHeight = 10 + Math.floor(Math.random() * 170);
                    const day = new Date();
                    day.setDate(day.getDate() - 6 + i);
                    const dayStr = ["일", "월", "화", "수", "목", "금", "토"][
                      day.getDay()
                    ];
                    const count = Math.floor(Math.random() * 20) + 5;

                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center flex-1 relative"
                      >
                        <div className="relative -top-3 text-center">
                          <span className="text-xs font-medium text-gray-700">
                            {count}개
                          </span>
                        </div>
                        <div
                          className={`w-full ${
                            i === 6 ? "bg-blue-500" : "bg-blue-200"
                          } rounded-t-sm`}
                          style={{ height: `${barHeight}px` }}
                        ></div>
                        <div className="text-xs text-gray-500 mt-2 text-center">
                          <div>{dayStr}</div>
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
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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
              </div>

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
              </div>
            </div>
          </div>
        )}

        {activeTab === "groups" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">그룹 목록</h2>
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                공동체 초대하기
              </button>
            </div>

            {groups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
                    onClick={() => navigate(`/office/group/${group.id}`)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {group.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {group.description}
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-gray-500 mr-1"
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
                        <span className="text-gray-600 font-medium">
                          그룹장: {group.leaderName}
                        </span>
                      </div>
                      <div className="text-blue-600 flex items-center">
                        <span className="text-xs">상세보기</span>
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  등록된 그룹이 없습니다
                </h3>
                <p className="text-gray-500 mb-4">
                  새 그룹을 만들어 공동체를 더 효과적으로 관리하세요
                </p>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  공동체 초대하기
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">멤버 목록</h2>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      이름
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      역할
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      소속 그룹
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      최근 활동
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      기도 횟수
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">편집</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {member.name.substring(0, 2)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            member.role === "리더"
                              ? "bg-green-100 text-green-800"
                              : member.role === "부리더"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {member.groupName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.lastActive}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.prayCount}회
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">
                          상세
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "prayers" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">기도 기록</h2>
              <div className="flex space-x-2">
                <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
                  <option>모든 멤버</option>
                  {groups.map((group) => (
                    <option key={group.id}>{group.name}</option>
                  ))}
                </select>
                <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
                  <option>이번 주</option>
                  <option>이번 달</option>
                  <option>전체 기간</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                        <span className="text-gray-600 font-medium">{`멤${
                          (i % 5) + 1
                        }`}</span>
                      </div>
                      <span className="text-sm font-medium">{`멤버 ${
                        (i % 5) + 1
                      }`}</span>
                    </div>
                    <span className="text-xs text-gray-500">{`${
                      i + 1
                    }일 전`}</span>
                  </div>
                  <h3 className="text-sm font-medium mb-2">
                    {
                      [
                        "가족을 위한 기도",
                        "교회를 위한 기도",
                        "건강을 위한 기도",
                        "직장을 위한 기도",
                        "선교지를 위한 기도",
                      ][i % 5]
                    }
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {`이 기도 제목은 ${
                      ["가족", "교회", "건강", "직장", "선교지"][i % 5]
                    }를 위한 기도입니다. 함께 기도해주세요.`}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>응답: {i % 3 === 0 ? "✓" : "대기중"}</span>
                    <span>
                      {Math.floor(Math.random() * 15) + 2}명이 함께 기도했습니다
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityDetailPage;
