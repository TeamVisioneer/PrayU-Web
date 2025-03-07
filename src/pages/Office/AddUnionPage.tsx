import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useOfficeStore from "@/stores/officeStore";
import { Church } from "@/data/mockOfficeData";
import { UnionFormData } from "@/stores/officeStore";

// 컴포넌트들
import ChurchSearch from "@/components/office/ChurchSearch";

// 단계 정의
enum AddUnionSteps {
  SELECT_CHURCH = "select_church",
  ENTER_UNION_INFO = "enter_union_info",
  COMPLETE = "complete",
}

const AddUnionPage: React.FC = () => {
  const navigate = useNavigate();
  const { addChurch, isChurchAdded, addUnion } = useOfficeStore();

  // 상태 관리
  const [currentStep, setCurrentStep] = useState<AddUnionSteps>(
    AddUnionSteps.SELECT_CHURCH
  );
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [unionName, setUnionName] = useState("");
  const [description, setDescription] = useState("");

  // 유효성 검사 상태
  const [unionNameError, setUnionNameError] = useState("");

  // 로딩 상태
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 외부 API 사용 여부 - 현재는 비활성화
  // const [useExternalApi, setUseExternalApi] = useState(false);
  const useExternalApi = false; // 외부 검색 비활성화

  // 교회 선택 핸들러
  const handleSelectChurch = (church: Church) => {
    setSelectedChurch(church);
    // 선택된 교회가 이미 추가되어 있지 않다면 자동으로 추가
    if (!isChurchAdded(church.id)) {
      addChurch(church);
    }
  };

  // 다음 단계로 이동
  const goToNextStep = () => {
    switch (currentStep) {
      case AddUnionSteps.SELECT_CHURCH:
        if (selectedChurch) {
          setCurrentStep(AddUnionSteps.ENTER_UNION_INFO);
        }
        break;
      case AddUnionSteps.ENTER_UNION_INFO:
        if (validateUnionInfo()) {
          handleSubmitUnion();
        }
        break;
      default:
        break;
    }
  };

  // 이전 단계로 이동
  const goToPreviousStep = () => {
    switch (currentStep) {
      case AddUnionSteps.ENTER_UNION_INFO:
        setCurrentStep(AddUnionSteps.SELECT_CHURCH);
        break;
      default:
        break;
    }
  };

  // 공동체 정보 유효성 검사
  const validateUnionInfo = () => {
    if (!unionName.trim()) {
      setUnionNameError("공동체 이름을 입력해주세요.");
      return false;
    } else {
      setUnionNameError("");
      return true;
    }
  };

  // 공동체 추가 제출 핸들러
  const handleSubmitUnion = () => {
    if (!selectedChurch) return;

    setIsSubmitting(true);
    try {
      const formData: UnionFormData = {
        name: unionName,
        pastorName: "미지정", // 기본값 설정
        description: description.trim() ? description : undefined,
        groupType: "union", // 기본값 설정
      };

      // 워크스페이스(공동체) 추가
      addUnion(selectedChurch.id, formData);

      // 완료 단계로 이동
      setCurrentStep(AddUnionSteps.COMPLETE);

      // 2초 후에 마이 공동체 페이지로 이동
      setTimeout(() => {
        navigate("/office");
      }, 2000);
    } catch (error) {
      console.error("Error adding union:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // API 소스 토글 - 현재는 비활성화
  /* 
  const toggleApiSource = () => {
    setUseExternalApi(!useExternalApi);
    setSelectedChurch(null); // API 소스 변경 시 선택된 교회 초기화
  };
  */

  // 페이지 타이틀 및 설명 렌더링
  const renderHeader = () => {
    let title = "";
    let description = "";

    switch (currentStep) {
      case AddUnionSteps.SELECT_CHURCH:
        title = "교회 선택";
        description = "소속 교회를 선택하세요";
        break;
      case AddUnionSteps.ENTER_UNION_INFO:
        title = "공동체 정보 입력";
        description = "공동체 이름과 정보를 입력하세요";
        break;
      case AddUnionSteps.COMPLETE:
        title = "완료";
        description = "공동체가 성공적으로 생성되었습니다";
        break;
    }

    return (
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>
    );
  };

  // 진행 상태 표시
  const renderProgressBar = () => {
    const steps = Object.values(AddUnionSteps);
    const currentIndex = steps.indexOf(currentStep);
    const percentage = ((currentIndex + 1) / steps.length) * 100;

    return (
      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="grid grid-cols-3 mt-2 text-center">
          <span className="text-xs text-gray-500">1. 교회 선택</span>
          <span className="text-xs text-gray-500">2. 공동체 정보</span>
          <span className="text-xs text-gray-500">3. 완료</span>
        </div>
      </div>
    );
  };

  // 교회 선택 단계 UI
  const renderSelectChurchStep = () => {
    return (
      <div>
        {/* 외부 검색 기능 - 현재는 비활성화
        <div className="flex items-center justify-end mb-2">
          <div className="flex items-center bg-gray-50 px-3 py-2 rounded-md">
            <span className="text-sm text-gray-700 mr-2">외부 검색</span>
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
        */}

        <div className="mb-4">
          <ChurchSearch
            onSelectChurch={handleSelectChurch}
            useExternalApi={useExternalApi}
            selectedChurchId={selectedChurch?.id}
          />

          {/* 외부 검색 안내 - 현재는 비활성화
          <div className="mt-3 text-sm text-gray-600 flex items-start">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <span>
              검색 결과에서 교회를 찾지 못한 경우 상단의 '외부 검색'을 활성화해 보세요.
            </span>
          </div>
          */}
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mt-6 text-sm text-blue-700">
          <h3 className="font-bold mb-2">공동체란?</h3>
          <p className="mb-2">
            공동체는 여러 그룹들의 집합입니다. 공동체를 생성하면 공동체의
            사역자가 소속된 그룹들의 기도 현황을 한눈에 볼 수 있습니다.
          </p>
          <p className="mb-2">
            공동체 생성 후, 그룹장들에게 공동체 초대를 보내 그룹들을 공동체에
            연결할 수 있습니다.
          </p>
          <p>
            <strong>예시:</strong> 청년부(공동체) → 1,2,3 셀(그룹들)
          </p>
        </div>
      </div>
    );
  };

  // 공동체 정보 입력 단계 UI
  const renderUnionInfoStep = () => {
    return (
      <div>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="unionName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              공동체 이름*
            </label>
            <input
              type="text"
              id="unionName"
              value={unionName}
              onChange={(e) => setUnionName(e.target.value)}
              placeholder="예: 청년부, 주일학교, 새가족부, 찬양팀"
              className={`w-full px-3 py-2 border ${
                unionNameError ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {unionNameError && (
              <p className="mt-1 text-sm text-red-600">{unionNameError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              공동체 설명 (선택)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="공동체에 대한 간단한 설명을 입력하세요"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    );
  };

  // 완료 단계 UI
  const renderCompleteStep = () => {
    return (
      <div className="text-center py-10">
        <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-2 text-green-600"
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
          <h2 className="text-xl font-bold">
            공동체가 성공적으로 생성되었습니다!
          </h2>
          <p className="mt-2">
            이제 그룹장들을 초대하여 공동체를 활성화해보세요.
          </p>
        </div>
        <p className="text-gray-600 mb-4">메인 페이지로 이동 중...</p>
        <div className="animate-pulse flex justify-center">
          <div className="h-2 w-2 bg-blue-600 rounded-full mx-1"></div>
          <div className="h-2 w-2 bg-blue-600 rounded-full mx-1 delay-100"></div>
          <div className="h-2 w-2 bg-blue-600 rounded-full mx-1 delay-200"></div>
        </div>
      </div>
    );
  };

  // 현재 단계에 따른 컨텐츠 렌더링
  const renderContent = () => {
    switch (currentStep) {
      case AddUnionSteps.SELECT_CHURCH:
        return renderSelectChurchStep();
      case AddUnionSteps.ENTER_UNION_INFO:
        return renderUnionInfoStep();
      case AddUnionSteps.COMPLETE:
        return renderCompleteStep();
      default:
        return null;
    }
  };

  // 하단 버튼 렌더링
  const renderButtons = () => {
    if (currentStep === AddUnionSteps.COMPLETE) return null;

    return (
      <div className="flex justify-between mt-8">
        {currentStep !== AddUnionSteps.SELECT_CHURCH && (
          <button
            type="button"
            onClick={goToPreviousStep}
            className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center"
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
            이전
          </button>
        )}

        <button
          type="button"
          onClick={goToNextStep}
          disabled={
            (currentStep === AddUnionSteps.SELECT_CHURCH && !selectedChurch) ||
            isSubmitting
          }
          className={`px-5 py-2.5 text-white rounded-md transition-colors flex items-center ml-auto ${
            (currentStep === AddUnionSteps.SELECT_CHURCH && !selectedChurch) ||
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              처리 중...
            </>
          ) : (
            <>
              {currentStep === AddUnionSteps.ENTER_UNION_INFO ? "완료" : "다음"}
              {currentStep !== AddUnionSteps.ENTER_UNION_INFO && (
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
              )}
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 헤더와 뒤로 가기 버튼 */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900 mr-4"
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
        <h1 className="text-xl font-bold">공동체 추가</h1>
      </div>

      {/* 진행 상태 표시 */}
      {renderProgressBar()}

      {/* 타이틀 및 설명 */}
      {renderHeader()}

      {/* 현재 단계 내용 */}
      {renderContent()}

      {/* 하단 버튼 */}
      {renderButtons()}
    </div>
  );
};

export default AddUnionPage;
