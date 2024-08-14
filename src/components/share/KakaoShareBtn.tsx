import { analyticsTrack } from "@/analytics/analytics";
import { getDomainUrl, getISOTodayDateYMD } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { Group } from "supabase/types/tables";
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
  targetGroup: Group | null;
  message: string;
  id: string;
  eventOption: EventOption;
  type?: string;
}

const getContent = (groupName: string, type: string) => {
  const today = getISOTodayDateYMD();
  const contentNumber = parseInt(today.day, 10) % 10;
  switch (type) {
    case "bible":
      return {
        title: `${today.year}.${today.month}.${today.day} 오늘의 말씀`,
        description: "PrayU에서 오늘의 말씀과 함께 기도해요!",
        imageUrl: `https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/BibleContent/content${contentNumber}.png`,
      };
    default:
      return {
        title: `PrayU - ${groupName}`,
        description: "우리만의 기도제목 나눔 공간\nPrayU에서 함께 기도해요!",
        imageUrl:
          "https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/introImage.png",
      };
  }
};

export const KakaoShareButton: React.FC<KakaoShareButtonProps> = ({
  targetGroup,
  id,
  message,
  type = "default",
  eventOption,
}) => {
  const groupUrl = `${getDomainUrl()}/${targetGroup!.id}`;
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
      const content = getContent(targetGroup!.name!, type);
      window.Kakao.Share.createDefaultButton({
        container: `#${id}`,
        objectType: "feed",
        content: {
          title: content.title,
          description: content.description,
          imageUrl: content.imageUrl,
          link: {
            mobileWebUrl: groupUrl,
            webUrl: groupUrl,
          },
        },
        buttons: [
          {
            title: "오늘의 기도",
            link: {
              mobileWebUrl: groupUrl,
              webUrl: groupUrl,
            },
          },
        ],
      });
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [targetGroup, groupUrl, id, type]);

  const buttonRef = useRef<HTMLButtonElement | null>(null);

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
};
