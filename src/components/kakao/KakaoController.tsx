import { getDomainUrl } from "@/lib/utils";

import * as Sentry from "@sentry/react";
import { KakaoTokenRefreshResponse, KakaoTokens } from "./Kakao";
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

  public getMyProfiles(): void {
    window.Kakao.API.request({
      url: "/v1/api/talk/profile",
    })
      .then((response) => {
        alert("success: " + JSON.stringify(response));
      })
      .catch((error) => {
        Sentry.captureException(error);
      });
  }

  public selectUsers(): void {
    window.Kakao.Picker.selectFriends({
      title: "친구 선택",
      maxPickableCount: 10,
      minPickableCount: 1,
    })
      .then((response) => {
        console.log(response);
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
        console.log(response);
        alert("success: " + JSON.stringify(response));
      })
      .catch((error: Error) => {
        Sentry.captureException(error);
      });
  }

  public sendMessage(baseUrl: string): void {
    window.Kakao.API.request({
      url: "/v2/api/talk/memo/scrap/send",
      data: {
        request_url: baseUrl,
      },
    })
      .then((response) => {
        alert("success: " + JSON.stringify(response));
      })
      .catch((error: Error) => {
        Sentry.captureException(error);
      });
  }
}
