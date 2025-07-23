import { useRef } from "react";
import { StepProps } from "./types";

/**
 * 사진 업로드 단계 컴포넌트
 * 감사 카드에 들어갈 사진을 업로드받습니다.
 */
export const PhotoStep = ({
  formData,
  onUpdate,
  onNext,
  onPrev,
}: StepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 이미지 파일인지 확인
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert("파일 크기는 5MB 이하여야 합니다.");
        return;
      }

      // 미리보기 URL 생성
      const previewUrl = URL.createObjectURL(file);
      onUpdate({
        photo: file,
        photoPreview: previewUrl,
      });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    if (formData.photoPreview) {
      URL.revokeObjectURL(formData.photoPreview);
    }
    onUpdate({
      photo: undefined,
      photoPreview: undefined,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-md mx-auto text-center">
      {/* 단계 안내 */}
      <div className="mb-8">
        <div className="text-4xl mb-4">📸</div>
        <h2 className="text-2xl sm:text-3xl font-medium text-slate-800 mb-3">
          감사 사진 추가
        </h2>
        <p className="text-lg text-slate-600">
          감사하는 순간의 사진을 올려보세요
        </p>
        <p className="text-sm text-slate-500 mt-2">(선택사항입니다)</p>
      </div>

      {/* 사진 업로드 영역 */}
      <div className="mb-8">
        {formData.photoPreview ? (
          /* 업로드된 사진 미리보기 */
          <div className="relative">
            <div className="w-64 h-64 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={formData.photoPreview}
                alt="업로드된 사진"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={handleRemovePhoto}
              className="absolute -top-2 -right-8 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
        ) : (
          /* 사진 업로드 버튼 */
          <div
            onClick={handleUploadClick}
            className="w-64 h-64 mx-auto border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <svg
              className="w-12 h-12 text-slate-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <p className="text-slate-500 text-center px-4">
              사진을 선택해주세요
              <br />
              <span className="text-sm">JPG, PNG (최대 5MB)</span>
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* 버튼 영역 */}
      <div className="space-y-3">
        <button
          onClick={onNext}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg font-medium transition-colors shadow-md hover:shadow-lg"
        >
          {formData.photo ? "다음 단계" : "사진 없이 계속하기"}
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
