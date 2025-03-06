import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChurchCard from "@/components/office/ChurchCard";
import GroupCard from "@/components/office/GroupCard";
import useOfficeStore from "@/stores/officeStore";

const MyChurchesPage: React.FC = () => {
  const navigate = useNavigate();
  const { myChurches, selectChurch, removeChurch, getCommunitiesByChurchId } =
    useOfficeStore();
  const [expandedChurchId, setExpandedChurchId] = useState<string | null>(null);

  const handleChurchClick = (churchId: string) => {
    if (expandedChurchId === churchId) {
      // 이미 확장된 교회를 다시 클릭하면 닫기
      setExpandedChurchId(null);
    } else {
      // 확장되지 않은 교회를 클릭하면 확장
      setExpandedChurchId(churchId);
    }
  };

  const handleViewChurchDetail = (churchId: string) => {
    const church = myChurches.find((c) => c.id === churchId);
    if (church) {
      selectChurch(church);
      navigate(`/office/church/${churchId}`);
    }
  };

  const handleAddCommunity = (churchId: string) => {
    const church = myChurches.find((c) => c.id === churchId);
    if (church) {
      selectChurch(church);
      navigate("/office/search"); // 공동체 추가 페이지로 이동
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate("/office")} className="mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-600"
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
        <h1 className="text-xl font-bold">내 교회</h1>
      </div>

      {myChurches.length === 0 ? (
        <div className="text-center py-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400"
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
          <p className="mt-4 text-gray-600">등록된 교회가 없습니다.</p>
          <button
            onClick={() => navigate("/office/search")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            교회 공동체 추가하기
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => navigate("/office/search")}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            >
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              교회 공동체 추가
            </button>
          </div>

          {myChurches.map((church) => {
            const communities = getCommunitiesByChurchId(church.id);
            const isExpanded = expandedChurchId === church.id;

            return (
              <div key={church.id} className="mb-6">
                <div className="relative">
                  <ChurchCard
                    church={church}
                    onClick={() => handleChurchClick(church.id)}
                  />
                  <button
                    className="absolute top-2 right-2 p-1 bg-red-100 rounded-full text-red-500 hover:bg-red-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeChurch(church.id);
                    }}
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
                </div>

                {isExpanded && (
                  <div className="pl-6 mt-2 border-l-2 border-blue-300">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-md font-medium">
                        소속 공동체 ({communities.length})
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewChurchDetail(church.id)}
                          className="px-3 py-1 text-xs bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200"
                        >
                          교회 상세보기
                        </button>
                        <button
                          onClick={() => handleAddCommunity(church.id)}
                          className="px-3 py-1 text-xs bg-blue-100 rounded-md text-blue-700 hover:bg-blue-200 flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-1"
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
                          공동체 추가
                        </button>
                      </div>
                    </div>

                    {communities.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600 text-sm">
                        아직 추가된 공동체가 없습니다.
                        <button
                          onClick={() => handleAddCommunity(church.id)}
                          className="block mx-auto mt-2 px-3 py-1 text-xs bg-blue-500 rounded-md text-white hover:bg-blue-600"
                        >
                          공동체 추가하기
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {communities.map((community) => (
                          <GroupCard
                            key={community.id}
                            group={community}
                            onClick={() => {
                              /* 공동체 상세 페이지로 이동 (추후 구현) */
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyChurchesPage;
