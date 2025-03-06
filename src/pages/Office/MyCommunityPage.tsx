import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useOfficeStore from "@/stores/officeStore";
import { Group } from "@/data/mockOfficeData";

const MyCommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { myCommunities, myChurches, removeCommunity } = useOfficeStore();
  const [filterBy, setFilterBy] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // URL 상태에서 필터 값을 가져오기
  useEffect(() => {
    if (location.state && location.state.filterBy) {
      setFilterBy(location.state.filterBy);
    }
  }, [location.state]);

  // 필터링된 워크스페이스 목록 가져오기
  const getFilteredWorkspaces = () => {
    let filtered = [...myCommunities];

    // 교회 필터
    if (filterBy) {
      filtered = filtered.filter(
        (community) => community.churchId === filterBy
      );
    }

    // 유형 필터
    if (filterType) {
      filtered = filtered.filter(
        (community) => community.groupType === filterType
      );
    }

    // 검색어 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (community) =>
          community.name.toLowerCase().includes(query) ||
          (community.description &&
            community.description.toLowerCase().includes(query)) ||
          (community.churchName &&
            community.churchName.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  // 워크스페이스 클릭 핸들러
  const handleWorkspaceClick = (community: Group) => {
    navigate(`/office/community/${community.id}`);
  };

  // 워크스페이스 삭제 핸들러
  const handleRemoveWorkspace = (workspaceId: string) => {
    if (
      window.confirm(
        "이 워크스페이스를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    ) {
      removeCommunity(workspaceId);
    }
  };

  const filteredWorkspaces = getFilteredWorkspaces();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/office")}
              className="mr-3 text-gray-500 hover:text-gray-700"
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
            <h1 className="text-xl font-bold">내 워크스페이스</h1>
          </div>
          <button
            onClick={() => navigate("/office/add-community")}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center hover:bg-blue-600 transition-colors"
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            새 워크스페이스
          </button>
        </div>

        {/* 검색 및 필터링 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="워크스페이스 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                교회
              </label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                value={filterBy || ""}
                onChange={(e) => setFilterBy(e.target.value || null)}
              >
                <option value="">모든 교회</option>
                {myChurches.map((church) => (
                  <option key={church.id} value={church.id}>
                    {church.name} (
                    {
                      myCommunities.filter((c) => c.churchId === church.id)
                        .length
                    }
                    )
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                유형
              </label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                value={filterType || ""}
                onChange={(e) => setFilterType(e.target.value || null)}
              >
                <option value="">모든 유형</option>
                <option value="community">소그룹</option>
                <option value="department">부서</option>
              </select>
            </div>
          </div>
        </div>

        {myCommunities.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-xl font-bold mb-2">워크스페이스가 없습니다</h2>
            <p className="text-gray-600 mb-4">
              첫 번째 워크스페이스를 만들어 공동체를 관리해보세요.
            </p>
            <button
              onClick={() => navigate("/office/church-search")}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              워크스페이스 추가하기
            </button>
          </div>
        ) : filteredWorkspaces.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-4">
              검색 조건에 맞는 워크스페이스가 없습니다.
            </p>
            <button
              onClick={() => {
                setFilterBy(null);
                setFilterType(null);
                setSearchQuery("");
              }}
              className="text-blue-500 hover:underline"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow border border-gray-100 flex flex-col relative group"
              >
                <button
                  onClick={() => handleRemoveWorkspace(workspace.id)}
                  className="absolute top-3 right-3 p-1.5 bg-red-50 rounded-full text-red-500 hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div
                  className="flex-grow cursor-pointer"
                  onClick={() => handleWorkspaceClick(workspace)}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-md bg-blue-500 text-white flex items-center justify-center mr-3 font-bold">
                      {workspace.name.substring(0, 1)}
                    </div>
                    <div>
                      <h3 className="font-medium">{workspace.name}</h3>
                      <p className="text-sm text-gray-500">
                        {workspace.churchName ||
                          myChurches.find((c) => c.id === workspace.churchId)
                            ?.name ||
                          "알 수 없는 교회"}
                      </p>
                    </div>
                  </div>

                  {workspace.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {workspace.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-auto">
                    <div className="text-xs text-gray-500">
                      멤버: {workspace.memberCount || 0}명
                      {workspace.pastorName && (
                        <span> • 담당: {workspace.pastorName}</span>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        workspace.groupType === "community"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {workspace.groupType === "community" ? "소그룹" : "부서"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCommunityPage;
