import {
  MemberWithProfiles,
  Notification,
  Pray,
  PrayCardWithProfiles,
} from "../../supabase/types/tables";
import {
  mockCurrentUser,
  mockMembers,
  mockPrayCardsWithPrays,
  mockUserPrayCardList,
} from "./mockData";
import { PrayType } from "@/Enums/prayType";

// 목업 API 함수들
export const createMockApiFunctions = () => {
  return {
    // 멤버 관련 목업 함수들
    fetchMemberListByGroupId: async (
      groupId: string,
      limit?: number,
      offset?: number,
    ): Promise<MemberWithProfiles[] | null> => {
      console.log(
        `[MOCK] fetchMemberListByGroupId called with groupId: ${groupId}`,
      );
      // 실제 페이지네이션 로직 시뮬레이션
      const start = offset || 0;
      const end = start + (limit || mockMembers.length);
      return mockMembers.slice(start, end);
    },

    fetchMemberCountByGroupId: async (
      groupId: string,
    ): Promise<number | null> => {
      console.log(
        `[MOCK] fetchMemberCountByGroupId called with groupId: ${groupId}`,
      );
      return mockMembers.length;
    },

    // 기도카드 관련 목업 함수들
    fetchUserPrayCardListByGroupId: async (
      currentUserId: string,
      groupId: string,
    ): Promise<PrayCardWithProfiles[] | null> => {
      console.log(
        `[MOCK] fetchUserPrayCardListByGroupId called with userId: ${currentUserId}, groupId: ${groupId}`,
      );
      return mockUserPrayCardList;
    },

    fetchOtherPrayCardListByGroupId: async (
      currentUserId: string,
      userId: string,
      groupId: string,
    ): Promise<PrayCardWithProfiles[] | null> => {
      console.log(
        `[MOCK] fetchOtherPrayCardListByGroupId called with currentUserId: ${currentUserId}, userId: ${userId}, groupId: ${groupId}`,
      );
      // 해당 사용자의 기도카드 반환
      return mockPrayCardsWithPrays.filter((card) => card.user_id === userId);
    },

    fetchGroupPrayCardList: async (
      groupId: string,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _currentUserId: string,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _startDt: string,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _endDt: string,
    ): Promise<PrayCardWithProfiles[] | null> => {
      console.log(
        `[MOCK] fetchGroupPrayCardList called with groupId: ${groupId}`,
      );

      // 오늘의 기도를 위한 특별한 목업 데이터 생성
      // 오늘 날짜의 기도 기록이 없는 카드들을 반환하여 TodayPrayBtn 필터링에 통과하도록 함
      const cardsForTodayPray = mockPrayCardsWithPrays.map((card) => ({
        ...card,
        pray: card.pray.filter((pray) => {
          // 오늘 이전의 기도 기록만 유지 (오늘 날짜 기록은 제거)
          const prayDate = new Date(pray.created_at);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          return prayDate < today;
        }),
      }));

      return cardsForTodayPray;
    },

    // 그룹 관련 목업 함수들
    getGroup: async (groupId: string): Promise<void> => {
      console.log(`[MOCK] getGroup called with groupId: ${groupId}`);
      // 이미 설정된 상태 유지 (아무것도 하지 않음)
    },

    // 프로필 관련 목업 함수들
    getProfile: async (userId: string) => {
      console.log(`[MOCK] getProfile called with userId: ${userId}`);
      const profile = mockMembers.find((member) => member.user_id === userId)
        ?.profiles;
      return profile || mockCurrentUser;
    },

    getMember: async (
      userId: string,
      groupId: string,
    ): Promise<MemberWithProfiles | null> => {
      console.log(
        `[MOCK] getMember called with userId: ${userId}, groupId: ${groupId}`,
      );
      return mockMembers.find((member) => member.user_id === userId) || null;
    },

    // 기도 관련 목업 함수들
    fetchTodayUserPrayByGroupId: async (userId: string, groupId: string) => {
      console.log(
        `[MOCK] fetchTodayUserPrayByGroupId called with userId: ${userId}, groupId: ${groupId}`,
      );
      // 오늘 기도한 것으로 시뮬레이션
      return mockPrayCardsWithPrays.slice(0, 2).map((card) => ({
        pray_card: card,
        ...card.pray[0],
      }));
    },

    // 🙏 **새로 추가된 기도 반응 관련 목업 함수들** 🙏
    createPray: async (
      prayCardId: string,
      userId: string,
      prayType: PrayType,
    ): Promise<Pray | null> => {
      console.log(
        `[MOCK] createPray called with prayCardId: ${prayCardId}, userId: ${userId}, prayType: ${prayType}`,
      );

      // 새로운 기도 반응 생성 시뮬레이션
      const newPray: Pray = {
        id: `pray-mock-${Date.now()}`,
        user_id: userId,
        pray_card_id: prayCardId,
        pray_type: prayType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };

      // 목업 기도카드의 pray 배열에 추가 (실제 상태 업데이트)
      const targetCard = mockPrayCardsWithPrays.find((card) =>
        card.id === prayCardId
      );
      if (targetCard) {
        const newPrayWithProfiles = {
          ...newPray,
          profiles: mockCurrentUser,
        };
        targetCard.pray.push(newPrayWithProfiles);
      }

      return newPray;
    },

    updatePray: async (
      prayCardId: string | undefined,
      userId: string | undefined,
      prayType: PrayType,
    ): Promise<Pray | null> => {
      console.log(
        `[MOCK] updatePray called with prayCardId: ${prayCardId}, userId: ${userId}, prayType: ${prayType}`,
      );

      if (!prayCardId || !userId) return null;

      // 기존 기도 반응 업데이트 시뮬레이션
      const targetCard = mockPrayCardsWithPrays.find((card) =>
        card.id === prayCardId
      );
      if (targetCard) {
        const existingPray = targetCard.pray.find((pray) =>
          pray.user_id === userId
        );
        if (existingPray) {
          existingPray.pray_type = prayType;
          existingPray.updated_at = new Date().toISOString();
          return existingPray;
        }
      }

      return null;
    },

    // 날짜 범위별 기도 목록 조회 (달력용)
    fetchPrayByDateRange: async (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _userId: string | undefined,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _startDt: string,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _endDt: string,
    ): Promise<Pray[] | null> => {
      console.log(`[MOCK] fetchPrayByDateRange called`);

      // 최근 7일간 기도한 것으로 시뮬레이션
      const mockPrays: Pray[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // 랜덤하게 일부 날짜에만 기도 기록 추가
        if (Math.random() > 0.3) {
          mockPrays.push({
            id: `pray-range-${i}`,
            user_id: mockCurrentUser.id,
            pray_card_id: mockPrayCardsWithPrays[0].id,
            pray_type: PrayType.PRAY,
            created_at: date.toISOString(),
            updated_at: date.toISOString(),
            deleted_at: null,
          });
        }
      }

      return mockPrays;
    },

    // 알림 관련 목업 함수들
    fetchNotificationCount: async (
      userId: string,
      unreadOnly?: boolean,
    ): Promise<number> => {
      console.log(
        `[MOCK] fetchNotificationCount called with userId: ${userId}, unreadOnly: ${unreadOnly}`,
      );
      return unreadOnly ? 3 : 10; // 읽지 않은 알림 3개, 전체 10개
    },

    fetchUserNotificationList: async (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _userId: string,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _unreadOnly?: boolean,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _limit?: number,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _offset?: number,
    ) => {
      console.log(`[MOCK] fetchUserNotificationList called`);
      return []; // 빈 배열 반환
    },

    createNotification: async (params: {
      userId: string | string[];
      senderId: string;
      groupId: string;
      title: string;
      body: string;
      type: string;
      data: Record<string, unknown>;
    }): Promise<Notification | null> => {
      console.log(`[MOCK] createNotification called`, params);

      // 알림 생성 시뮬레이션 (실제로는 저장하지 않음)
      const mockNotification: Notification = {
        id: `notification-mock-${Date.now()}`,
        user_id: Array.isArray(params.userId)
          ? params.userId[0]
          : params.userId,
        sender_id: params.senderId,
        group_id: params.groupId,
        title: params.title,
        body: params.body,
        type: params.type,
        data: params.data,
        created_at: new Date().toISOString(),
        checked_at: null,
        completed_at: null,
        deleted_at: null,
        fcm_result: {},
      };

      return mockNotification;
    },

    createOnesignalPush: async (params: {
      title: string;
      subtitle: string;
      message: string;
      data: Record<string, unknown>;
      userIds: string[];
    }) => {
      console.log(`[MOCK] createOnesignalPush called`, params);

      // 푸시 알림 전송 시뮬레이션
      return {
        id: `push-mock-${Date.now()}`,
        recipients: params.userIds?.length || 0,
        external_id: null,
      };
    },
  };
};

// 목업 API 함수들을 baseStore에 적용하는 함수
export const applyMockApiFunctions = () => {
  const mockFunctions = createMockApiFunctions();

  // baseStore의 함수들을 목업 함수로 오버라이드
  return mockFunctions;
};
