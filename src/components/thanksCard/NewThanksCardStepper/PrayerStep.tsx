import { StepProps } from "./types";

/**
 * 기도제목 입력 단계 컴포넌트
 * 감사 내용을 입력받습니다.
 */
export const PrayerStep = ({
  formData,
  onUpdate,
  onNext,
  onPrev,
  isLoading,
}: StepProps) => {
  const maxLength = 70;

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    if (content.length <= maxLength) {
      onUpdate({ prayerContent: content });
    }
  };

  const handleNext = () => {
    if (formData.prayerContent.trim()) {
      onNext();
    }
  };

  return (
    <div className="max-w-md mx-auto text-center">
      {/* 단계 안내 */}
      <div className="mb-8">
        <div className="text-4xl mb-4">🙏</div>
        <h2 className="text-2xl sm:text-3xl font-medium text-slate-800 mb-3">
          감사 내용 작성
        </h2>
        <p className="text-lg text-slate-600">어떤 일로 감사하시나요?</p>
      </div>

      {/* 기도제목 입력 */}
      <div className="mb-8">
        <div className="relative">
          <textarea
            value={formData.prayerContent}
            onChange={handleContentChange}
            placeholder="감사하는 마음을 자유롭게 적어보세요&#10;&#10;예) 새로운 직장을 주셔서 감사합니다.&#10;예) 어려운 상황에서도 하나님의 은혜를 경험하게 해주셔서 감사드립니다."
            className="w-full px-4 py-4 text-base border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
            rows={8}
          />

          {/* 글자수 카운터 */}
          <div className="absolute bottom-4 right-4 text-sm text-slate-400">
            {formData.prayerContent.length}/{maxLength}
          </div>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="space-y-3">
        <button
          onClick={handleNext}
          disabled={!formData.prayerContent.trim() || isLoading}
          className={`w-full py-4 px-6 rounded-2xl text-lg font-medium transition-all duration-200 flex items-center justify-center ${
            formData.prayerContent.trim() && !isLoading
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              감사 카드 생성 중...
            </>
          ) : (
            "감사 카드 완성하기"
          )}
        </button>

        <button
          onClick={onPrev}
          disabled={isLoading}
          className={`w-full py-3 px-6 rounded-2xl font-medium transition-colors ${
            isLoading
              ? "text-slate-400 cursor-not-allowed"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          이전 단계
        </button>
      </div>
    </div>
  );
};
