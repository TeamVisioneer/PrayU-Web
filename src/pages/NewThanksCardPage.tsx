import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  NameStep,
  PhotoStep,
  PrayerStep,
  CompletionStep,
  ThanksCardFormData,
  StepType,
} from "@/components/thanksCard/NewThanksCardStepper";

/**
 * 감사 카드 생성 페이지
 * 4단계 stepper 형태로 카드 생성 과정을 안내합니다.
 *
 * 단계:
 * 1. 이름 입력
 * 2. 사진 업로드 (선택사항)
 * 3. 감사 내용 작성
 * 4. 완료 및 결과 확인
 */
const NewThanksCardPage = () => {
  const navigate = useNavigate();

  // 폼 데이터 상태
  const [formData, setFormData] = useState<ThanksCardFormData>({
    name: "",
    photo: undefined,
    photoPreview: undefined,
    prayerContent: "",
  });

  // 현재 단계 상태
  const [currentStep, setCurrentStep] = useState<StepType>("name");

  // 완료된 카드 번호 (실제로는 API에서 받아올 값)
  const [cardNumber] = useState(() => Math.floor(Math.random() * 1000) + 3000);

  // 단계별 정보
  const steps = [
    { key: "name" as StepType, title: "이름", number: 1 },
    { key: "photo" as StepType, title: "사진", number: 2 },
    { key: "prayer" as StepType, title: "감사내용", number: 3 },
    { key: "completion" as StepType, title: "완료", number: 4 },
  ];

  const currentStepIndex = steps.findIndex((step) => step.key === currentStep);

  // 폼 데이터 업데이트
  const updateFormData = (data: Partial<ThanksCardFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  // 다음 단계로 이동
  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    }
  };

  // 이전 단계로 이동
  const handlePrev = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  // 감사카드 모아보기 (메인 페이지로 이동)
  const handleViewAllCards = () => {
    navigate("/thanks-card");
  };

  // 현재 단계에 따른 컴포넌트 렌더링
  const renderStep = () => {
    const stepProps = {
      formData,
      onUpdate: updateFormData,
      onNext: handleNext,
      onPrev: handlePrev,
    };

    switch (currentStep) {
      case "name":
        return <NameStep {...stepProps} />;
      case "photo":
        return <PhotoStep {...stepProps} />;
      case "prayer":
        return <PrayerStep {...stepProps} />;
      case "completion":
        return (
          <CompletionStep
            formData={formData}
            cardNumber={cardNumber}
            onViewAllCards={handleViewAllCards}
          />
        );
      default:
        return <NameStep {...stepProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 헤더 */}
      <header className="shadow-sm">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="p-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-lg font-medium text-slate-800">
              감사 카드 만들기
            </h1>
            <div className="w-10" /> {/* 스페이서 */}
          </div>
        </div>
      </header>

      {/* 진행률 표시기 */}
      {currentStep !== "completion" && (
        <div className="max-w-md mx-auto px-4 py-6">
          {/* 진행률 바 */}
          <div className="mb-4">
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${
                    ((currentStepIndex + 1) / (steps.length - 1)) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* 단계 표시 */}
          <div className="w-full flex items-center justify-between ">
            {steps.slice(0, -1).map((step, index) => (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    index <= currentStepIndex
                      ? "bg-blue-600 text-white shadow-lg scale-110"
                      : index === currentStepIndex + 1
                      ? "bg-blue-100 text-blue-600 border-2 border-blue-300"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {index < currentStepIndex ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium transition-colors ${
                    index <= currentStepIndex
                      ? "text-blue-600"
                      : "text-slate-400"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <main className="px-4 py-8">{renderStep()}</main>
    </div>
  );
};

export default NewThanksCardPage;
