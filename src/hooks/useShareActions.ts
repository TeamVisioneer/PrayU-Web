import { toast } from "@/components/ui/use-toast";
import { analyticsTrack } from "@/analytics/analytics";
import { UserBibleCardLink } from "@/components/share/KakaoShareBtn";

interface UseShareActionsProps {
  where: string;
  publicUrl?: string;
  kakaoLinkObject?: ReturnType<typeof UserBibleCardLink>;
}

interface UseShareActionsReturn {
  handleDownload: () => Promise<void>;
  handleCopyLink: () => Promise<void>;
  handleSocialShare: () => Promise<void>;
  handleKakaoShare: () => Promise<void>;
  handleInstagramShare: () => Promise<void>;
}

/**
 * 공유 기능을 위한 커스텀 훅
 *
 * @param where - Analytics 추적을 위한 위치 정보
 * @param publicUrl - 공유할 이미지 URL (다운로드, 인스타그램 공유에 사용)
 * @param kakaoLinkObject - 카카오톡 공유를 위한 링크 객체
 * @returns 공유 관련 핸들러 함수들
 */
export const useShareActions = ({
  where,
  publicUrl,
  kakaoLinkObject,
}: UseShareActionsProps): UseShareActionsReturn => {
  const handleDownload = async () => {
    analyticsTrack("클릭_다운로드", { where });

    if (
      window.flutter_inappwebview &&
      window.flutter_inappwebview.callHandler
    ) {
      if (!publicUrl) {
        toast({ description: "다운로드할 이미지가 없습니다" });
        return;
      }

      const result = (await window.flutter_inappwebview.callHandler(
        "downloadImages",
        [publicUrl],
      )) as { status: string };

      if (result.status === "success") {
        toast({ description: "다운로드 완료" });
      } else {
        toast({ description: "다운로드 실패" });
      }
    } else {
      toast({ description: "앱에서만 사용 가능한 기능입니다" });
    }
  };

  const handleCopyLink = async () => {
    analyticsTrack("클릭_공유_링크복사", { where });
    const copyUrl = publicUrl || window.location.href;

    try {
      await navigator.clipboard.writeText(copyUrl);
      toast({ description: "링크가 복사되었어요" });
    } catch (error) {
      console.error("링크 복사 실패:", error);
      toast({ description: "링크 복사에 실패했습니다" });
    }
  };

  const handleSocialShare = async () => {
    analyticsTrack("클릭_공유_소셜공유", { where });
    const currentUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          url: currentUrl,
        });
      } else {
        toast({ description: "공유 기능을 지원하지 않는 브라우저입니다" });
      }
    } catch (error) {
      // 사용자가 공유를 취소한 경우 에러가 발생하지만 무시
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("공유 실패:", error);
      }
    }
  };

  const handleKakaoShare = async () => {
    analyticsTrack("클릭_카카오_공유", { where });

    try {
      if (!window.Kakao) {
        toast({ description: "카카오톡 공유 기능을 불러오는 중입니다" });
        return;
      }

      if (kakaoLinkObject) {
        window.Kakao.Share.sendDefault(kakaoLinkObject);
      } else if (publicUrl) {
        // publicUrl이 있으면 기본 링크 객체 생성
        const defaultLinkObject = UserBibleCardLink(publicUrl);
        window.Kakao.Share.sendDefault(defaultLinkObject);
      } else {
        toast({ description: "공유할 내용이 없습니다" });
      }
    } catch (error) {
      console.error("카카오톡 공유 실패:", error);
      toast({ description: "카카오톡 공유에 실패했습니다" });
    }
  };

  const handleInstagramShare = async () => {
    analyticsTrack("클릭_인스타그램_공유", { where });

    if (
      window.flutter_inappwebview &&
      window.flutter_inappwebview.callHandler
    ) {
      if (!publicUrl) {
        toast({ description: "공유할 이미지가 없습니다" });
        return;
      }

      try {
        await window.flutter_inappwebview.callHandler(
          "shareInstagramStory",
          publicUrl,
        );
      } catch (error) {
        console.error("인스타그램 공유 실패:", error);
        toast({ description: "인스타그램 공유에 실패했습니다" });
      }
    } else {
      toast({ description: "앱에서만 사용 가능한 기능입니다" });
    }
  };

  return {
    handleDownload,
    handleCopyLink,
    handleSocialShare,
    handleKakaoShare,
    handleInstagramShare,
  };
};
