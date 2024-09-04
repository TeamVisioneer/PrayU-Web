import * as Sentry from "@sentry/react";
import {
  KakaoFriendsResponse,
  KakaoLinkObject,
  KakaoMessageObject,
} from "./Kakao";
import { KakaoTokenRepo } from "./KakaoTokenRepo";

// 본 컨트롤러 사용처에서 로그인 페이지로 이동 할 수 있다는 것 인지
export class KakaoController {
  constructor() {
    KakaoTokenRepo.init();
  }

  public getMyProfiles() {
    window.Kakao.API.request({
      url: "/v1/api/talk/profile",
    })
      .then((response) => {
        console.log(response);
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

  public fetchFriends() {
    window.Kakao.API.request({
      url: "/v1/api/talk/friends",
    })
      .then((response) => {
        console.log(response);
        return response;
      })
      .catch((error: Error) => {
        console.error(error);
        Sentry.captureException(error);
        return null;
      });
  }

  public sendMessageForMe(message: KakaoMessageObject) {
    window.Kakao.API.request({
      url: "/v2/api/talk/memo/default/send",
      data: { template_object: message },
    })
      .then((response) => {
        return response;
      })
      .catch((error: Error) => {
        Sentry.captureException(error);
      });
  }

  public sendMessageForFriends(
    message: KakaoMessageObject,
    friendsUUID: string[]
  ) {
    window.Kakao.API.request({
      url: "/v1/api/talk/friends/message/default/send",
      data: {
        receiver_uuids: friendsUUID,
        template_object: message,
      },
    })
      .then((response) => {
        console.log(response);
        return response;
      })
      .catch((error: Error) => {
        console.error(error);
        Sentry.captureException(error);
      });
  }
}
