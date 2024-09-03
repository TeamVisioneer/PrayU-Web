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
  API: {
    request: (params: KakaoAPIRequestParams) => Promise<KakaoAPIResponse>;
  };
  Auth: {
    authorize: (options: { redirectUri: string; scope: string }) => void;
    setAccessToken: (token: string) => void;
  };
  Picker: {
    selectFriends: (options: {
      title: string;
      maxPickableCount: number;
      minPickableCount: number;
    }) => Promise<SelectedUsers>;
  };
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

interface SelectedUser {
  uuid: string; // 친구마다 고유한 값을 가지는 참고용 코드
  id?: string; // 친구의 회원번호 (선택 필드)
  profile_nickname?: string; // 카카오톡 프로필 닉네임 (선택 필드)
  profile_thumbnail_image?: string; // 카카오톡 프로필 썸네일 이미지 (선택 필드)
  favorite?: boolean; // 카카오톡 친구 즐겨찾기 설정 여부 (선택 필드)
}

interface SelectedUsers {
  selectedTotalCount: number; // 친구 피커에서 사용자가 선택한 친구 수
  users?: SelectedUser[]; // 선택한 친구 정보 목록 (선택 필드)
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
