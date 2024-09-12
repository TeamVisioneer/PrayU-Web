import * as Sentry from "@sentry/react";
import {
  KakaoFriendsResponse,
  KakaoMessageObject,
  KakaoSendMessageResponse,
} from "./Kakao";
import { KakaoTokenRepo } from "./KakaoTokenRepo";

// 본 컨트롤러 사용처에서 로그인 페이지로 이동 할 수 있다는 것 인지
export class KakaoController {
  constructor() {
    KakaoTokenRepo.init();
  }

  static async getMyProfiles() {
    try {
      const response = await window.Kakao.API.request({
        url: "/v1/api/talk/profile",
      });
      return response;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  static async selectUsers() {
    try {
      const response = await window.Kakao.Picker.selectFriends({
        title: "공유할 친구 선택",
        showFavorite: false,
      });
      return response;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  static async fetchFriends(): Promise<KakaoFriendsResponse | null> {
    try {
      const response = await window.Kakao.API.request({
        url: "/v1/api/talk/friends",
        data: { offset: 0, limit: 100 },
      });
      return response as KakaoFriendsResponse;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  static async sendMessageForMe(
    message: KakaoMessageObject
  ): Promise<KakaoSendMessageResponse | null> {
    try {
      const response = await window.Kakao.API.request({
        url: "/v2/api/talk/memo/default/send",
        data: { template_object: message },
      });
      return response as KakaoSendMessageResponse;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  static async sendMessageForFriends(
    message: KakaoMessageObject,
    friendsUUID: string[]
  ): Promise<KakaoSendMessageResponse | null> {
    try {
      if (friendsUUID.length == 0) return null;
      const response = await window.Kakao.API.request({
        url: "/v1/api/talk/friends/message/default/send",
        data: {
          receiver_uuids: friendsUUID,
          template_object: message,
        },
      });
      return response as KakaoSendMessageResponse;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  static async sendDirectMessage(
    message: KakaoMessageObject,
    kakaoId: string
  ): Promise<KakaoSendMessageResponse | null> {
    try {
      const kakaoFriendsResponse: KakaoFriendsResponse | null =
        await this.fetchFriends();
      if (!kakaoFriendsResponse) return null;
      const targetFriend = kakaoFriendsResponse.elements.find(
        (friend) => String(friend.id) === kakaoId
      );
      if (!targetFriend) return null;
      const kakaoMessageResponse: KakaoSendMessageResponse | null =
        await this.sendMessageForFriends(message, [targetFriend.uuid]);
      return kakaoMessageResponse;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }
}
