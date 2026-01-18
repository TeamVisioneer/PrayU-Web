import React from "react";
import { Download, Link2, Share2 } from "lucide-react";
import kakaoShareIcon from "@/assets/kakaoShareIcon.png";
import instagramIcon from "@/assets/SocialShare/instagram.jpg";
import useBaseStore from "@/stores/baseStore";
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
    <section className="w-full">
      <div className="flex justify-center items-center gap-3">
        {showDownload && (
          <button
            onClick={handleDownload}
            className="p-2.5 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110"
            aria-label="다운로드"
          >
            <Download size={24} className="text-gray-700" strokeWidth={2} />
          </button>
        )}
        <button
          onClick={handleCopyLink}
          className="p-2.5 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110"
          aria-label="링크 복사"
        >
          <Link2 size={24} className="text-gray-700" strokeWidth={2} />
        </button>

        <button
          onClick={handleKakaoShare}
          className="p-2.5 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110"
          aria-label="카카오톡 공유"
        >
          <img src={kakaoShareIcon} className="w-6 h-6" alt="카카오톡" />
        </button>
        {showInstagram && (
          <button
            onClick={handleInstagramShare}
            className="p-2.5 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110"
            aria-label="인스타그램 공유"
          >
            <div className="w-6 h-6 overflow-hidden rounded-full">
              <img
                src={instagramIcon}
                className="w-full h-full object-cover scale-150"
                alt="인스타그램"
              />
            </div>
          </button>
        )}
      </div>
    </section>
  );
};

export default ShareButtonGroup;
