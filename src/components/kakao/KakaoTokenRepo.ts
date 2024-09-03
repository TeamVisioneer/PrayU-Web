import * as Sentry from "@sentry/react";

export interface KakaoTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope: string;
  token_type: string;
}
export interface KakaoTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

export class KakaoTokenRepo {
  private static readonly ACCESS_TOKEN_COOKIE_NAME = "kakao_access_token";
  private static readonly REFRESH_TOKEN_COOKIE_NAME = "kakao_refresh_token";
  private static readonly CLIENT_ID = import.meta.env.VITE_KAKAO_REST_API_KEY;
  private static readonly CLIENT_SECRET = import.meta.env
    .VITE_KAKAO_CLIENT_SECRET_KEY;

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
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  static async refreshKakaoToken(refreshToken: string) {
    const data = {
      grant_type: "refresh_token",
      client_id: this.CLIENT_ID,
      refresh_token: refreshToken,
    };

    try {
      const response = await fetch("https://kauth.kakao.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(data),
      });

      const responseData = await response.json();
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

  static setKakaoTokensInCookie(kakaoTokenResponse: KakaoTokenResponse) {
    const now = new Date();

    const accessTokenExpires = new Date(
      now.getTime() + kakaoTokenResponse.expires_in * 1000
    );
    document.cookie = `${this.ACCESS_TOKEN_COOKIE_NAME}=${
      kakaoTokenResponse.access_token
    }; expires=${accessTokenExpires.toUTCString()}; path=/; secure; HttpOnly`;

    if (kakaoTokenResponse.refresh_token) {
      const refreshTokenExpires = new Date(
        now.getTime() + kakaoTokenResponse.refresh_token_expires_in * 1000
      );
      document.cookie = `${this.REFRESH_TOKEN_COOKIE_NAME}=${
        kakaoTokenResponse.refresh_token
      }; expires=${refreshTokenExpires.toUTCString()}; path=/; secure; HttpOnly`;
    }
  }
}
