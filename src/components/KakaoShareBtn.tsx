import { useEffect } from "react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Kakao: Kakao;
  }
}

interface Kakao {
  init: (apiKey: string) => void;
  isInitialized: () => boolean;
  Share: {
    createDefaultButton: (options: KakaoLinkObject) => void;
  };
}

interface KakaoLinkObject {
  container: string;
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
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
    script.integrity =
      "sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4";
    script.crossOrigin = "anonymous";
    script.async = true;

    script.onload = () => {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(`${import.meta.env.VITE_KAKAO_JS_KEY}`);
      }
      window.Kakao.Share.createDefaultButton({
        container: "#kakaotalk-sharing-btn",
        objectType: "feed",
        content: {
          title: "PrayU",
          description: "PrayU와 함께 기도해요!",
          imageUrl: "이미지주소",
          link: {
            mobileWebUrl: webUrl,
            webUrl: webUrl,
          },
        },

        buttons: [
          {
            title: "오늘의 기도",
            link: {
              mobileWebUrl: `${import.meta.env.VITE_BASE_URL}`,
              webUrl: `${import.meta.env.VITE_BASE_URL}`,
            },
          },
          {
            title: "내 기도제목",
            link: {
              mobileWebUrl: `${import.meta.env.VITE_BASE_URL}`,
              webUrl: `${import.meta.env.VITE_BASE_URL}`,
            },
          },
        ],
      });
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <Button id="kakaotalk-sharing-btn" variant="ghost" size="icon">
      <img src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png" />
    </Button>
  );
};
