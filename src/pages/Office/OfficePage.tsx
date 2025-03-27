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
        {myUnions.map((union) => (
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
                      <span className="line-clamp-1">{union.description}</span>
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
          <h2
            onClick={() => {
              navigate("/group");
            }}
            className="text-lg font-bold text-gray-800"
          >
            PrayU Office
          </h2>
          <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            Beta
          </span>
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

          {/* 공동체 목록 */}
          <div>{renderContent()}</div>

          {/* 베타 서비스 알림 */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-lg shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  베타 서비스 안내
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    PrayU Office는 현재 베타 서비스로 운영 중입니다. 서비스 이용
                    중 불편하신 점이나 개선 사항이 있으시면 언제든지 피드백
                    부탁드립니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficePage;
