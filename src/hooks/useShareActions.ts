import { toast } from "@/components/ui/use-toast";
import { analyticsTrack } from "@/analytics/analytics";
import { UserBibleCardLink } from "@/components/share/KakaoShareBtn";

interface UseShareActionsProps {
  where: string;
  publicUrl?: string;
  shareUrl?: string;
  kakaoLinkObject?: ReturnType<typeof UserBibleCardLink>;
  // 카카오 공유 성공 웹훅(공유 보상)용 사용자 정의 파라미터 — 있어야 웹훅이 발송된다
  kakaoServerCallbackArgs?: Record<string, string>;
}

interface UseShareActionsReturn {
  handleDownload: () => Promise<void>;
  handleCopyLink: () => Promise<void>;
  handleSocialShare: () => Promise<void>;
  handleKakaoShare: () => Promise<void>;
  handleInstagramShare: () => Promise<void>;
}

const getAbsoluteUrl = (url: string) => {
  try {
    return new URL(url, window.location.origin).toString();
  } catch {
    return url;
  }
};

const copyText = async (text: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      console.warn("Clipboard API 복사 실패, fallback을 시도합니다:", error);
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const isCopied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!isCopied) {
    throw new Error("document.execCommand copy failed");
  }
};

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
  shareUrl,
  kakaoLinkObject,
  kakaoServerCallbackArgs,
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
    const copyUrl = getAbsoluteUrl(
      shareUrl || publicUrl || window.location.href,
    );

    try {
      await copyText(copyUrl);
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

      const linkObject =
        kakaoLinkObject ||
        (publicUrl ? UserBibleCardLink(publicUrl, shareUrl) : null);
      if (!linkObject) {
        toast({ description: "공유할 내용이 없습니다" });
        return;
      }
      window.Kakao.Share.sendDefault({
        ...linkObject,
        ...(kakaoServerCallbackArgs
          ? { serverCallbackArgs: kakaoServerCallbackArgs }
          : {}),
      });
    } catch (error) {
      // PC 웹 피커는 카카오계정 인증 실패(4017)가 잦다 — 로그인 확인 안내
      console.error("카카오톡 공유 실패:", error);
      toast({
        description: "공유에 실패했어요. 카카오 로그인 상태를 확인해 주세요",
      });
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
