import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChurchSearch from "@/components/office/ChurchSearch";
import ChurchCard from "@/components/office/ChurchCard";
import UnionForm from "@/components/office/UnionForm";
import useOfficeStore from "@/stores/officeStore";
import { Church } from "@/data/mockOfficeData";
import { UnionFormData } from "@/stores/officeStore";

enum AddSteps {
  SEARCH_CHURCH = "search_church",
  WORKSPACE_INFO = "workspace_info",
  COMPLETE = "complete",
}

const ChurchSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { addChurch, isChurchAdded, addUnion } = useOfficeStore();
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [useExternalApi, setUseExternalApi] = useState(false);
  const [currentStep, setCurrentStep] = useState<AddSteps>(
    AddSteps.SEARCH_CHURCH
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectChurch = (church: Church) => {
    setSelectedChurch(church);
    // 선택된 교회가 이미 추가되어 있지 않다면 자동으로 추가
    if (!isChurchAdded(church.id)) {
      addChurch(church);
    }
  };

  const handleAddChurch = () => {
    if (!selectedChurch) return;

    // 교회를 추가한 후 워크스페이스 정보 입력 단계로 이동
    addChurch(selectedChurch);
    setCurrentStep(AddSteps.WORKSPACE_INFO);
  };

  const handleWorkspaceSubmit = (formData: UnionFormData) => {
    if (!selectedChurch) return;

    setIsSubmitting(true);
    try {
      // 워크스페이스(공동체) 추가
      addUnion(selectedChurch.id, formData);

      // 완료 단계로 이동
      setCurrentStep(AddSteps.COMPLETE);

      // 잠시 후 메인 페이지로 이동
      setTimeout(() => {
        navigate("/office");
      }, 2000);
    } catch (error) {
      console.error("Error adding workspace:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleApiSource = () => {
    setUseExternalApi(!useExternalApi);
    setSelectedChurch(null); // API 소스 변경 시 선택된 교회 초기화
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case AddSteps.SEARCH_CHURCH:
        return (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">새 워크스페이스 추가</h2>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">외부 검색</span>
                <button
                  onClick={toggleApiSource}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    useExternalApi ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useExternalApi ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm text-blue-700">
              <p>소속 교회를 검색하고 새 워크스페이스를 추가하세요</p>
              <p className="mt-1">
                워크스페이스는 소그룹, 부서 등 교회 내 공동체를 의미합니다.
              </p>
            </div>

            <ChurchSearch
              onSelectChurch={handleSelectChurch}
              useExternalApi={useExternalApi}
            />

            {selectedChurch && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-3">선택된 교회</h2>
                <ChurchCard
                  church={selectedChurch}
                  showAddButton={false}
                  isAdded={isChurchAdded(selectedChurch.id)}
                />

                <button
                  onClick={handleAddChurch}
                  className="w-full mt-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
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
                  이 교회에 새 워크스페이스 만들기
                </button>
              </div>
            )}
          </>
        );

      case AddSteps.WORKSPACE_INFO:
        return (
          <>
            <div className="mb-4">
              <button
                onClick={() => setCurrentStep(AddSteps.SEARCH_CHURCH)}
                className="text-blue-500 flex items-center mb-2"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                교회 다시 선택하기
              </button>
              <h2 className="text-lg font-semibold">워크스페이스 정보 입력</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedChurch?.name} 교회에 새 워크스페이스를 추가합니다
              </p>
            </div>

            {selectedChurch && (
              <UnionForm
                selectedChurch={selectedChurch}
                onSubmit={handleWorkspaceSubmit}
                onCancel={() => setCurrentStep(AddSteps.SEARCH_CHURCH)}
              />
            )}
          </>
        );

      case AddSteps.COMPLETE:
        return (
          <div className="text-center py-10">
            {isSubmitting ? (
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">처리 중입니다...</p>
              </div>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <h2 className="text-xl font-bold mt-4">
                  워크스페이스 추가 완료!
                </h2>
                <p className="mt-2 text-gray-600">
                  새 워크스페이스가 성공적으로 추가되었습니다.
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  잠시 후 워크스페이스 목록으로 이동합니다...
                </p>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/office")}
            className="mr-2 text-gray-500 hover:text-gray-700"
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
          <h1 className="text-xl font-bold">
            {currentStep === AddSteps.SEARCH_CHURCH
              ? "교회 검색"
              : currentStep === AddSteps.WORKSPACE_INFO
              ? "워크스페이스 정보 입력"
              : "완료"}
          </h1>
        </div>

        {/* 진행 단계 표시 */}
        <div className="mb-6 bg-white rounded-lg p-3 shadow">
          <div className="flex items-center">
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center ${
                currentStep === AddSteps.SEARCH_CHURCH
                  ? "bg-blue-500 text-white"
                  : "bg-blue-100 text-blue-500"
              }`}
            >
              1
            </div>
            <div
              className={`flex-1 h-1 ${
                currentStep !== AddSteps.SEARCH_CHURCH
                  ? "bg-blue-500"
                  : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center ${
                currentStep === AddSteps.WORKSPACE_INFO
                  ? "bg-blue-500 text-white"
                  : currentStep === AddSteps.COMPLETE
                  ? "bg-blue-100 text-blue-500"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </div>
            <div
              className={`flex-1 h-1 ${
                currentStep === AddSteps.COMPLETE
                  ? "bg-blue-500"
                  : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center ${
                currentStep === AddSteps.COMPLETE
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              3
            </div>
          </div>
          <div className="flex justify-between mt-1 text-xs">
            <span
              className={
                currentStep === AddSteps.SEARCH_CHURCH
                  ? "text-blue-500 font-medium"
                  : "text-gray-500"
              }
            >
              교회 검색
            </span>
            <span
              className={
                currentStep === AddSteps.WORKSPACE_INFO
                  ? "text-blue-500 font-medium"
                  : "text-gray-500"
              }
            >
              워크스페이스 정보
            </span>
            <span
              className={
                currentStep === AddSteps.COMPLETE
                  ? "text-green-500 font-medium"
                  : "text-gray-500"
              }
            >
              완료
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default ChurchSearchPage;
