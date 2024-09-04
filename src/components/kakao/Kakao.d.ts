export declare global {
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

export interface KakaoTokenResponse {
  token_type: string;
  access_token: string;
  id_token?: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope?: string;
}

export interface KakaoTokenRefreshResponse {
  token_type: string;
  access_token: string;
  id_token?: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
}
export interface KakaoTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

interface KakaoProfileResponse extends KakaoAPIResponse {
  id: number;
  nickname: string;
  profileImageURL: string;
  thumbnailURL: string;
  countryISO: string;
}

interface KakaoFriendsResponse extends KakaoAPIResponse {
  elements: Friend[];
  total_count: number;
  after_url?: string;
  resultId?: string;
}

interface KakaoSelectFriendsResponse extends KakaoAPIResponse {
  users: Friend[];
}

interface KakaoSendMessageResponse extends KakaoAPIResponse {
  successful_receiver_uuids: string[];
}

interface Friend {
  id: number;
  uuid: string;
  favorite: boolean;
  profile_nickname: string;
  profile_thumbnail_image: string;
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
