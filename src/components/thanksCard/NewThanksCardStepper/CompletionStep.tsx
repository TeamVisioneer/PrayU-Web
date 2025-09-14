import { CompletionStepProps } from "./types";
import { ThanksCardItem } from "../ThanksCardItem";
import { ThanksCard } from "../types";

/**
 * 완료 단계 컴포넌트
 * 완성된 감사 카드를 보여주고 완료 메시지를 표시합니다.
 */
export const CompletionStep = ({
  formData,
  cardNumber,
  onViewAllCards,
}: CompletionStepProps) => {
  if (cardNumber === null) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-medium text-slate-800 mb-4">
          카드 생성 중 문제가 발생했습니다
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center">
      {/* 완료 축하 메시지 */}
      <div className="mb-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl sm:text-3xl font-medium text-slate-800 mb-3">
          감사 카드가 완성되었어요!
        </h2>
        <p className="text-lg text-blue-600 font-medium mb-2">
          {cardNumber}번째 감사카드가 작성되었어요
        </p>
        <p className="text-base text-slate-600">
          소중한 감사의 마음을 나눠주셔서 감사합니다
        </p>
      </div>

      {/* 완성된 카드 미리보기 */}
      <div className="mb-8 max-w-xs mx-auto">
        <ThanksCardItem
          card={
            {
              id: cardNumber, // 임시 ID (미리보기용)
              user_name: formData.name,
              content: formData.prayerContent,
              image: formData.photoPreview || "",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
            } as ThanksCard
          }
        />
      </div>

      {/* 액션 버튼들 */}
      <div className="space-y-3">
        <button
          onClick={onViewAllCards}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg font-medium transition-colors shadow-md hover:shadow-lg"
        >
          📚 감사카드 모아보기
        </button>

        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-medium transition-colors"
        >
          새 감사카드 작성하기
        </button>
      </div>

      {/* 공유 안내 */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <p className="text-sm text-slate-600 mb-2">
          💝 감사 카드가 대형 화면에 표시됩니다
        </p>
        <p className="text-xs text-slate-500">
          여러분의 감사가 더 많은 사람들에게 전해져요
        </p>
      </div>
    </div>
  );
};
