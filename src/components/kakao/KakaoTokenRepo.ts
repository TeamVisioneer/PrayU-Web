import * as Sentry from "@sentry/react";
import {
  KakaoTokenRefreshResponse,
  KakaoTokenResponse,
  KakaoTokens,
} from "./Kakao";
import { getDomainUrl } from "@/lib/utils";

export class KakaoTokenRepo {
  private static KAKAOTOKENS: KakaoTokens;
  private static BASEURL: string;
  private static readonly ACCESS_TOKEN_COOKIE_NAME = "kakao_access_token";
  private static readonly REFRESH_TOKEN_COOKIE_NAME = "kakao_refresh_token";
  private static readonly CLIENT_ID = import.meta.env.VITE_KAKAO_REST_API_KEY;
  private static readonly CLIENT_SECRET = import.meta.env
    .VITE_KAKAO_CLIENT_SECRET_KEY;

  static async init() {
    this.KAKAOTOKENS = KakaoTokenRepo.getKakaoTokensInCookie();
    this.BASEURL = getDomainUrl();

    if (this.KAKAOTOKENS.accessToken) {
      window.Kakao.Auth.setAccessToken(this.KAKAOTOKENS.accessToken);
    } else if (this.KAKAOTOKENS.refreshToken) {
      KakaoTokenRepo.refreshKakaoToken(this.KAKAOTOKENS.refreshToken)
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
        redirectUri: `${this.BASEURL}/auth/kakao/callback`,
        scope: "friends,talk_message",
      });
    }
  }

  static isInit() {
    const kakaoTokens = KakaoTokenRepo.getKakaoTokensInCookie();
    return Boolean(kakaoTokens.accessToken) || Boolean(kakaoTokens.accessToken);
  }

  static async fetchKakaoToken(
    code: string,
    redirectUri: string
  ): Promise<KakaoTokenResponse | null> {
    const data = {
      grant_type: "authorization_code",
      client_id: this.CLIENT_ID,
      client_secret: this.CLIENT_SECRET,
      redirect_uri: redirectUri,
      code: code,
    };

    try {
      const response = await fetch("https://kauth.kakao.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        body: new URLSearchParams(data).toString(),
      });
      const responseData: KakaoTokenResponse = await response.json();
      return responseData;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  static async refreshKakaoToken(
    refreshToken: string
  ): Promise<KakaoTokenRefreshResponse | null> {
    const data = {
      grant_type: "refresh_token",
      client_id: this.CLIENT_ID,
      refresh_token: refreshToken,
      client_secret: this.CLIENT_SECRET,
    };

    try {
      const response = await fetch("https://kauth.kakao.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(data),
      });
      const responseData: KakaoTokenResponse = await response.json();
      return responseData;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  static getKakaoTokensInCookie(): KakaoTokens {
    const cookies = document.cookie.split("; ");
    const kakaoTokens: KakaoTokens = {
      accessToken: null,
      refreshToken: null,
    };

    cookies.forEach((cookie) => {
      const [name, value] = cookie.split("=");
      if (name === this.ACCESS_TOKEN_COOKIE_NAME) {
        kakaoTokens.accessToken = value;
      }
      if (name === this.REFRESH_TOKEN_COOKIE_NAME) {
        kakaoTokens.refreshToken = value;
      }
    });

    return kakaoTokens;
  }

  static setKakaoTokensInCookie(
    kakaoTokenResponse: KakaoTokenResponse | KakaoTokenRefreshResponse
  ) {
    const now = new Date();

    const accessTokenExpires = new Date(
      now.getTime() + kakaoTokenResponse.expires_in * 1000
    );
    document.cookie = `${this.ACCESS_TOKEN_COOKIE_NAME}=${
      kakaoTokenResponse.access_token
    }; expires=${accessTokenExpires.toUTCString()}; path=/`;

    if (
      kakaoTokenResponse.refresh_token &&
      kakaoTokenResponse.refresh_token_expires_in
    ) {
      const refreshTokenExpires = new Date(
        now.getTime() + kakaoTokenResponse.refresh_token_expires_in * 1000
      );
      document.cookie = `${this.REFRESH_TOKEN_COOKIE_NAME}=${
        kakaoTokenResponse.refresh_token
      }; expires=${refreshTokenExpires.toUTCString()}; path=/`;
    }
  }
}
