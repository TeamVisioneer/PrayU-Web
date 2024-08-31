import React, { useEffect } from "react";

declare global {
  interface Window {
    Kakao: Kakao;
  }
}

interface Kakao {
  init: (apiKey: string) => void;
  isInitialized: () => boolean;
  Share: {
    sendDefault: (options: KakaoLinkObject) => void;
    sendScrap: (options: { requestUrl: string }) => void;
  };
  API: KakaoAPI;
}
interface KakaoAPI {
  request: (params: KakaoAPIRequestParams) => Promise<KakaoAPIResponse>;
}

interface KakaoAPIRequestParams {
  url: string;
  data?: Record<string, unknown>;
}

interface KakaoAPIResponse {
  nickname?: string;
  profile_image_url?: string;
  thumbnail_image_url?: string;
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

const KakaoInit: React.FC = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
    script.integrity =
      "sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4";
    script.crossOrigin = "anonymous";
    script.async = true;
    script.onload = () => {
      if (window.Kakao) {
        window.Kakao.init(`${import.meta.env.VITE_KAKAO_JS_KEY}`);
      }
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
};

export default KakaoInit;
