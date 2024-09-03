import { getDomainUrl } from "@/lib/utils";
import { KakaoTokenRepo, KakaoTokens } from "./KakaoTokenRepo";

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
        .then((newAccessToken) => {
          if (newAccessToken) {
            window.Kakao.Auth.setAccessToken(newAccessToken);
          } else {
            console.error("Failed to refresh access token.");
          }
        })
        .catch((error) => {
          console.error("Error while refreshing access token:", error);
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
      .catch((error: Error) => {
        console.log(error);
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
        console.log(error);
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
        console.log(error);
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
        console.log(error);
      });
  }
}
