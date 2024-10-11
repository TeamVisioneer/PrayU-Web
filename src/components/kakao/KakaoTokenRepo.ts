import * as Sentry from "@sentry/react";
import {
  KakaoTokenRefreshResponse,
  KakaoTokenResponse,
  KakaoTokens,
} from "./Kakao";
import { getDomainUrl } from "@/lib/utils";
import { supabase } from "../../../supabase/client";

export class KakaoTokenRepo {
  private static readonly ACCESS_TOKEN_COOKIE_NAME = "kakao_access_token";
  private static readonly REFRESH_TOKEN_COOKIE_NAME = "kakao_refresh_token";
  private static readonly CLIENT_ID = import.meta.env.VITE_KAKAO_REST_API_KEY;
  private static readonly CLIENT_SECRET = import.meta.env
    .VITE_KAKAO_CLIENT_SECRET_KEY;

  static async init(state: string = ""): Promise<string | null> {
    const KAKAOTOKENS = this.getKakaoTokensInCookie();

    if (KAKAOTOKENS.accessToken) {
      window.Kakao.Auth.setAccessToken(KAKAOTOKENS.accessToken);
      return KAKAOTOKENS.accessToken;
    } else if (KAKAOTOKENS.refreshToken) {
      const response: KakaoTokenRefreshResponse | null =
        await this.refreshKakaoToken(KAKAOTOKENS.refreshToken);
      if (response) {
        this.setKakaoTokensInCookie(response);
        window.Kakao.Auth.setAccessToken(response.access_token);
        return response.access_token;
      }
    } else {
      this.openKakaoLoginPagePre(state);
    }
    return null;
  }

  static openKakaoLoginPagePre(state: string) {
    const BASEURL = getDomainUrl();
    try {
      window.Kakao.Auth.authorize({
        redirectUri: `${BASEURL}/auth/kakao/callback`,
        scope: "friends,talk_message",
        state: state,
      });
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  static async openKakaoLoginPage(groupId: string = "", from: string = "") {
    const BASEURL = getDomainUrl();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${BASEURL}/login-redirect?groupId=${groupId}&from=${from}`,
        scopes: "friends,talk_message",
      },
    });
    if (error) {
      console.error("Kakao login error:", error.message);
      Sentry.captureException(error.message);
    }
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
      if (response.status !== 200) {
        this.cleanKakaoTokensInCookies();
        return null;
      }
      const responseData: KakaoTokenResponse = await response.json();
      this.setKakaoTokensInCookie(responseData);
      window.Kakao.Auth.setAccessToken(responseData.access_token);
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
      if (response.status !== 200) {
        this.cleanKakaoTokensInCookies();
        return null;
      }
      const responseData: KakaoTokenRefreshResponse = await response.json();
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

    if (kakaoTokenResponse.access_token && kakaoTokenResponse.expires_in) {
      const accessTokenExpires = new Date(
        now.getTime() + kakaoTokenResponse.expires_in * 1000
      );
      document.cookie = `${this.ACCESS_TOKEN_COOKIE_NAME}=${
        kakaoTokenResponse.access_token
      }; expires=${accessTokenExpires.toUTCString()}; path=/`;
    }
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

  static cleanKakaoTokensInCookies() {
    const pastDate = new Date(0).toUTCString();
    document.cookie = `${this.ACCESS_TOKEN_COOKIE_NAME}=; expires=${pastDate}; path=/`;
    document.cookie = `${this.REFRESH_TOKEN_COOKIE_NAME}=; expires=${pastDate}; path=/`;
  }
}
