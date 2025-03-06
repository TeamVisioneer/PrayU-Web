import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GroupCard from "@/components/office/GroupCard";
import useOfficeStore from "@/stores/officeStore";

const ChurchDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { churchId } = useParams<{ churchId: string }>();
  const {
    selectedChurch,
    churchGroups,
    loadChurchGroups,
    getChurchById,
    getCommunitiesByChurchId,
  } = useOfficeStore();

  const church = churchId ? getChurchById(churchId) : null;

  useEffect(() => {
    if (churchId) {
      loadChurchGroups(churchId);
    }
  }, [churchId, loadChurchGroups, selectedChurch?.id, churchGroups.length]);

  const communities = churchId ? getCommunitiesByChurchId(churchId) : [];

  if (!selectedChurch && !church) {
    return (
      <div className="p-4 text-center">
        <div className="py-10">
          <p className="text-gray-600">해당 교회를 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate("/office/my-churches")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            내 교회 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const displayChurch = selectedChurch || church;

  const handleAddCommunity = () => {
    navigate("/office/search");
  };

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/office/my-churches")}
          className="mr-2"
        >
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
        <h1 className="text-xl font-bold">교회 정보</h1>
      </div>

      {displayChurch && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="font-bold text-lg mb-3">{displayChurch.name}</h2>
          <div className="text-gray-600 mb-2 text-sm">
            {displayChurch.address}
          </div>
          {displayChurch.externalData && (
            <div className="mt-4 space-y-1 text-gray-700 text-sm">
              {displayChurch.externalData.denomination && (
                <div className="flex items-center">
                  <span className="font-medium mr-2">교단:</span>
                  <span>{displayChurch.externalData.denomination}</span>
                </div>
              )}
              {displayChurch.externalData.phone && (
                <div className="flex items-center">
                  <span className="font-medium mr-2">전화번호:</span>
                  <span>{displayChurch.externalData.phone}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 공동체 섹션 */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            소속 공동체 ({communities.length})
          </h2>
          <button
            onClick={handleAddCommunity}
            className="px-3 py-1 text-sm bg-blue-500 rounded-md text-white hover:bg-blue-600 flex items-center"
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
            공동체 추가
          </button>
        </div>

        {communities.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400 mb-3"
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
            <p className="mb-4">아직 추가된 공동체가 없습니다.</p>
            <button
              onClick={handleAddCommunity}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              새 공동체 추가하기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {communities.map((community) => (
              <GroupCard
                key={community.id}
                group={community}
                onClick={() => {
                  /* 추후 공동체 상세 페이지로 이동 기능 구현 */
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChurchDetailPage;
