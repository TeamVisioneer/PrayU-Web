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
}: StepProps) => {
  const maxLength = 100;

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
            placeholder="감사하는 마음을 자유롭게 적어보세요&#10;&#10;예) 새로운 직장을 주셔서 감사합니다. 어려운 상황에서도 하나님의 은혜를 경험하게 해주셔서 감사드립니다."
            className="w-full px-4 py-4 text-base border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
            rows={8}
            autoFocus
          />

          {/* 글자수 카운터 */}
          <div className="absolute bottom-3 right-3 text-sm text-slate-400">
            {formData.prayerContent.length}/{maxLength}
          </div>
        </div>

        {/* 미리보기 */}
        {formData.prayerContent && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-slate-600 mb-2">미리보기:</p>
            <p className="text-sm text-slate-800 leading-relaxed">
              {formData.prayerContent.slice(0, 80)}
              {formData.prayerContent.length > 80 && "..."}
            </p>
          </div>
        )}
      </div>

      {/* 버튼 영역 */}
      <div className="space-y-3">
        <button
          onClick={handleNext}
          disabled={!formData.prayerContent.trim()}
          className={`w-full py-4 px-6 rounded-2xl text-lg font-medium transition-all duration-200 ${
            formData.prayerContent.trim()
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          감사 카드 완성하기
        </button>

        <button
          onClick={onPrev}
          className="w-full py-3 px-6 text-slate-600 hover:text-slate-800 transition-colors"
        >
          이전 단계
        </button>
      </div>
    </div>
  );
};
