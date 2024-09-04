import { getDomainUrl } from "@/lib/utils";

import * as Sentry from "@sentry/react";
import {
  KakaoLinkObject,
  KakaoTokenRefreshResponse,
  KakaoTokens,
} from "./Kakao";
import { KakaoTokenRepo } from "./KakaoTokenRepo";

// 본 컨트롤러 사용처에서 로그인 페이지로 이동 할 수 있다는 것 인지
export class KakaoController {
  private kakaoTokens: KakaoTokens;
  private baseUrl: string;

  constructor() {
    this.kakaoTokens = KakaoTokenRepo.getKakaoTokensInCookie();
    this.baseUrl = getDomainUrl();

    if (this.kakaoTokens.accessToken) {
      window.Kakao.Auth.setAccessToken(this.kakaoTokens.accessToken);
    } else if (this.kakaoTokens.refreshToken) {
      KakaoTokenRepo.refreshKakaoToken(this.kakaoTokens.refreshToken)
        .then((response: KakaoTokenRefreshResponse | null) => {
          if (response) {
            KakaoTokenRepo.setKakaoTokensInCookie(response);
            window.Kakao.Auth.setAccessToken(response.access_token);
          }
        })
        .catch((error) => {
          Sentry.captureException(error);
        });
    } else {
      window.Kakao.Auth.authorize({
        redirectUri: `${this.baseUrl}/auth/kakao/callback`,
        scope: "friends,talk_message",
      });
    }
  }

  public getMyProfiles() {
    window.Kakao.API.request({
      url: "/v1/api/talk/profile",
    })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        Sentry.captureException(error);
        return null;
      });
  }

  public selectUsers() {
    window.Kakao.Picker.selectFriends({
      title: "친구 선택",
      maxPickableCount: 10,
      minPickableCount: 1,
    })
      .then((response) => {
        return response;
      })
      .catch((error: Error) => {
        Sentry.captureException(error);
      });
  }

  public fetchFriends(): void {
    window.Kakao.API.request({
      url: "/v1/api/talk/friends",
    })
      .then((response) => {
        return response;
      })
      .catch((error: Error) => {
        Sentry.captureException(error);
      });
  }

  public sendMessageForMe(kakaoLinkObject: KakaoLinkObject): void {
    window.Kakao.API.request({
      url: "/v2/api/talk/memo/default/send",
      data: { template_object: kakaoLinkObject },
    })
      .then((response) => {
        return response;
      })
      .catch((error: Error) => {
        Sentry.captureException(error);
      });
  }

  public sendMessageForFriend(
    kakaoLinkObject: KakaoLinkObject,
    friendUUID: string[]
  ): void {
    window.Kakao.API.request({
      url: "/v1/api/talk/friends/message/default/send",
      data: {
        receiver_uuids: friendUUID,
        template_object: kakaoLinkObject,
      },
    })
      .then((response) => {
        return response;
      })
      .catch((error: Error) => {
        Sentry.captureException(error);
      });
  }
}
