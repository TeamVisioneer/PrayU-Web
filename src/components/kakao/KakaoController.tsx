import * as Sentry from "@sentry/react";
import {
  KakaoFriendsResponse,
  KakaoMessageObject,
  KakaoScopeResponse,
  KakaoSendMessageResponse,
} from "./Kakao";

export class KakaoController {
  static async checkKakaoScope(): Promise<boolean> {
    try {
      const response: KakaoScopeResponse = await window.Kakao.API.request({
        url: "/v2/user/scopes",
        data: { scopes: ["friends", "talk_message"] },
      });
      const hasDisagreedScope = response.scopes.some((scope) => !scope.agreed);
      if (hasDisagreedScope) return false;
      else return true;
    } catch (error) {
      Sentry.captureException(error);
      return false;
    }
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
