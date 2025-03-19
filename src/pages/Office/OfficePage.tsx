import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useOfficeStore from "@/stores/officeStore";
import useAuth from "@/hooks/useAuth";

// Hide scrollbar but allow scrolling
const hideScrollbarStyle = `
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;  /* Chrome, Safari, Opera */
  }
`;

const OfficePage: React.FC = () => {
  const navigate = useNavigate();
  const { myUnions, fetchMyUnions, isLoadingUnions } = useOfficeStore();
  const { user } = useAuth();
  // const [searchQuery, setSearchQuery] = useState("");

  // 컴포넌트 마운트 시 공동체 목록 로드
  useEffect(() => {
    if (user?.id) {
      fetchMyUnions(user.id);
    }
  }, [fetchMyUnions, user]);

  // 유니온 선택 처리
  const handleUnionSelect = (unionId: string) => {
    navigate(`/office/union/${unionId}`);
  };

  // 상태에 따른 컨텐츠 렌더링
  const renderContent = () => {
    if (isLoadingUnions) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">공동체를 불러오는 중...</p>
        </div>
      );
    }

    if (myUnions.length === 0) {
      return (
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
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            아직 등록된 공동체가 없습니다
          </h3>
          <p className="text-gray-500 mb-4">
            새로운 공동체를 만들어 시작하세요
          </p>
          <button
            onClick={() => navigate("/office/union/new")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            새 공동체 만들기
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-3">
        {myUnions
          // .filter((union) =>
          //   searchQuery
          //     ? union.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          //       (union.description &&
          //         union.description
          //           .toLowerCase()
          //           .includes(searchQuery.toLowerCase()))
          //     : true
          // )
          .map((union) => (
            <div
              key={union.id}
              onClick={() => handleUnionSelect(union.id)}
              className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center mr-3 bg-blue-100 text-blue-600">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{union.name}</h4>
                  <div className="flex flex-wrap items-center mt-1 text-sm text-gray-500">
                    <span className="font-medium text-gray-600">
                      {union.churchName}
                    </span>
                    {union.description && (
                      <>
                        <span className="mx-1.5">•</span>
                        <span className="line-clamp-1">
                          {union.description}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* CSS for hiding scrollbars */}
      <style>{hideScrollbarStyle}</style>

      {/* 상단 네비게이션 바 */}
      <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-lg font-bold text-gray-800">PrayU Office</h2>
        </div>

        <div className="flex items-center">
          <button
            onClick={() => navigate("/office/union/new")}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
            aria-label="새 공동체 추가"
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-6xl mx-auto">
          {/* 대시보드 헤더 */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              교회 공동체 관리
            </h1>
            <p className="text-gray-600 text-sm">
              교회 공동체를 효과적으로 관리하세요
            </p>
          </div>

          {/* 검색 창 */}
          {/* <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="공동체 검색..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
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
          </div> */}

          {/* 공동체 목록 */}
          <div>
            {/* <h2 className="text-lg font-semibold mb-3">교회 공동체</h2> */}
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficePage;
