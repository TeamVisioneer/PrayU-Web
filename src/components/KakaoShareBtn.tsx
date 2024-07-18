import React, { useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Kakao: Kakao;
  }
}

interface Kakao {
  init: (apiKey: string) => void;
  isInitialized: () => boolean;
  Link: {
    sendDefault: (linkObject: KakaoLinkObject) => void;
  };
}

interface KakaoLinkObject {
  objectType: string;
  content: {
    title: string;
    description: string;
    imageUrl: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
  };
  buttons: Array<{
    title: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
  }>;
}

interface KakaoShareButtonProps {
  webUrl: string;
}

export const KakaoShareButton: React.FC<KakaoShareButtonProps> = ({
  webUrl,
}) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.1.0/kakao.min.js";
    script.async = true;

    script.onload = () => {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(`${import.meta.env.VITE_KAKAO_APP_KEY}`);
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const shareToKakao = (shareUrl: string) => {
    if (window.Kakao) {
      window.Kakao.Link.sendDefault({
        objectType: "feed",
        content: {
          title: "카카오톡 공유하기",
          description: "이것은 카카오톡 공유 예제입니다.",
          imageUrl: "IMAGE_URL_HERE",
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: "웹으로 보기",
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
    }
  };

  return (
    <Button onClick={() => shareToKakao(webUrl)} variant="ghost" size="icon">
      <img src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png" />
    </Button>
  );
};
