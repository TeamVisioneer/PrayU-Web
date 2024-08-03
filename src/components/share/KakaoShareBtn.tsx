import { analyticsTrack } from "@/analytics/analytics";
import { useEffect, useRef } from "react";
import prayCardImageUrl from "/images/prayCard.png";

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

interface EventOption {
  where: string;
}

interface KakaoShareButtonProps {
  groupPageUrl: string;
  message?: string;
  id: string;
  img?: string;
  eventOption: EventOption;
}

export const KakaoShareButton: React.FC<KakaoShareButtonProps> = ({
  groupPageUrl,
  message,
  id,
  img,
  eventOption,
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
        container: `#${id}`,
        objectType: "feed",
        content: {
          title: "PrayU 우리만의 기도제목 나눔 공간",
          description: "기도제목을 기록하고\n매일 반응하며 함께 기도해요!",
          imageUrl: prayCardImageUrl,
          link: {
            mobileWebUrl: groupPageUrl,
            webUrl: groupPageUrl,
          },
        },
        buttons: [
          {
            title: "오늘의 기도",
            link: {
              mobileWebUrl: groupPageUrl,
              webUrl: groupPageUrl,
            },
          },
        ],
      });
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [groupPageUrl, id]);

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const kakaoDefaultImage = "/images/kakaotalk_sharing_btn_medium.png";

  if (message) {
    return (
      <div className="relative">
        <div
          className="absolute w-full h-full "
          onClick={() => {
            analyticsTrack("클릭_카카오_공유", {
              where: eventOption.where,
            });
            buttonRef.current?.click();
          }}
        ></div>
        <button
          ref={buttonRef}
          id={id}
          className="bg-yellow-300 px-10 py-2 rounded-md text-sm"
        >
          <p className="text-black">{message}</p>
        </button>
      </div>
    );
  }
  return (
    <div className="relative">
      <div
        className="absolute w-full h-full "
        onClick={() => {
          analyticsTrack("클릭_카카오_공유", { where: eventOption.where });
          buttonRef.current?.click();
        }}
      ></div>
      <button ref={buttonRef} id={id} className="bg-mainBg p-2 rounded-md">
        <img src={img ?? kakaoDefaultImage} className="w-5 h-5" />
      </button>
    </div>
  );
};
