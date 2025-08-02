import { StepProps } from "./types";

/**
 * 이름 입력 단계 컴포넌트
 * 사용자의 이름을 입력받습니다.
 */
export const NameStep = ({ formData, onUpdate, onNext }: StepProps) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ name: e.target.value });
  };

  const handleNext = () => {
    if (formData.name.trim()) {
      onNext();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNext();
    }
  };

  return (
    <div className="max-w-md mx-auto text-center">
      {/* 단계 안내 */}
      <div className="mb-8">
        <div className="text-4xl mb-4">👋</div>
        <h2 className="text-2xl sm:text-3xl font-medium text-slate-800 mb-3">
          안녕하세요!
        </h2>
        <p className="text-lg text-slate-600">
          감사 카드에 들어갈 이름을 알려주세요
        </p>
      </div>

      {/* 이름 입력 */}
      <div className="mb-8">
        <input
          type="text"
          value={formData.name}
          onChange={handleNameChange}
          onKeyPress={handleKeyPress}
          placeholder="이름을 입력해주세요"
          className="w-full px-4 py-4 text-lg text-center border-2 border-slate-200 rounded-2xl focus:border-blue-500  transition-colors focus:placeholder:text-transparent"
          maxLength={20}
          autoFocus
        />
        {formData.name && (
          <p className="mt-2 text-sm text-slate-500">
            "{formData.name} 님의 감사기도"로 표시됩니다
          </p>
        )}
      </div>

      {/* 다음 버튼 */}
      <button
        onClick={handleNext}
        disabled={!formData.name.trim()}
        className={`w-full py-4 px-6 rounded-2xl text-lg font-medium transition-all duration-200 ${
          formData.name.trim()
            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        }`}
      >
        다음 단계
      </button>
    </div>
  );
};
