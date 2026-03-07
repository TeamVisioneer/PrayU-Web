import { Download, Link2 } from "lucide-react";
import kakaoShareIcon from "@/assets/kakaoShareIcon.png";
import instagramIcon from "@/assets/SocialShare/instagram.jpg";
import { useShareActions } from "@/hooks/useShareActions";

interface ShareButtonGroupProps {
  where: string;
  publicUrl?: string;
  showDownload?: boolean;
  showInstagram?: boolean;
}

/**
 * 공유 버튼 그룹 컴포넌트
 *
 * @param where - Analytics 추적을 위한 위치 정보
 * @param publicUrl - 공유할 이미지 URL (다운로드, 인스타그램 공유에 사용)
 * @param showDownload - 다운로드 버튼 표시 여부 (기본: true)
 * @param showInstagram - 인스타그램 공유 버튼 표시 여부 (기본: true)
 */
const ShareButtonGroup: React.FC<ShareButtonGroupProps> = ({
  where,
  publicUrl,
  showDownload = true,
  showInstagram = true,
}) => {

  const {
    handleDownload,
    handleCopyLink,
    handleKakaoShare,
    handleInstagramShare,
  } = useShareActions({ where, publicUrl });

  return (
    <section className="w-full py-3 sm:py-4">
      <div className="grid grid-cols-4 gap-x-2 gap-y-3 px-3 sm:gap-x-3 sm:px-4">
        {showDownload && (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleDownload}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 transition-all duration-200 hover:scale-105 hover:bg-gray-100 active:scale-95 sm:h-16 sm:w-16"
              aria-label="저장"
            >
              <Download className="h-6 w-6 text-gray-700 sm:h-7 sm:w-7" strokeWidth={2} />
            </button>
            <span className="text-xs font-medium text-gray-500">저장</span>
          </div>
        )}
        
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 transition-all duration-200 hover:scale-105 hover:bg-gray-100 active:scale-95 sm:h-16 sm:w-16"
            aria-label="링크 복사"
          >
            <Link2 className="h-6 w-6 text-gray-700 sm:h-7 sm:w-7" strokeWidth={2} />
          </button>
          <span className="text-xs font-medium text-gray-500">링크 복사</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleKakaoShare}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200 bg-gray-50 hover:scale-105 active:scale-95 sm:h-16 sm:w-16"
            aria-label="카카오톡"
          >
            <img
              src={kakaoShareIcon}
              className="h-10 w-10 object-contain"
              alt="카카오톡"
            />
          </button>
          <span className="text-xs font-medium text-gray-500">카카오톡</span>
        </div>

        {showInstagram && (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleInstagramShare}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200 bg-gray-50 hover:scale-105 active:scale-95 sm:h-16 sm:w-16"
              aria-label="인스타그램"
            >
              <div className="h-8 w-8 overflow-hidden rounded-md sm:h-8 sm:w-8">
                <img
                  src={instagramIcon}
                  className="w-full h-full object-cover scale-150"
                  alt="인스타그램"
                />
              </div>
            </button>
            <span className="text-xs font-medium text-gray-500">인스타그램</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default ShareButtonGroup;
