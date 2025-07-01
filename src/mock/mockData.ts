import {
  Group,
  MemberWithProfiles,
  PrayCardWithProfiles,
  PrayWithProfiles,
  Profiles,
} from "../../supabase/types/tables";
import { PrayType } from "@/Enums/prayType";

// 목업 프로필 데이터 (UUID 사용)
export const mockProfiles: Profiles[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    full_name: "김기도",
    avatar_url: "/images/avatar/avatar_1.png",
    updated_at: new Date().toISOString(),
    username: "kim_prayer",
    website: null,
    blocking_users: [],
    created_at: new Date().toISOString(),
    fcm_token: "",
    kakao_id: null,
    kakao_notification: true,
    push_notification: true,
    terms_agreed_at: new Date().toISOString(),
    app_settings: {},
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    full_name: "이찬양",
    avatar_url: "/images/avatar/avatar_2.png",
    updated_at: new Date().toISOString(),
    username: "lee_praise",
    website: null,
    blocking_users: [],
    created_at: new Date().toISOString(),
    fcm_token: "",
    kakao_id: null,
    kakao_notification: true,
    push_notification: true,
    terms_agreed_at: new Date().toISOString(),
    app_settings: {},
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    full_name: "박은혜",
    avatar_url: "/images/avatar/avatar_3.png",
    updated_at: new Date().toISOString(),
    username: "park_grace",
    website: null,
    blocking_users: [],
    created_at: new Date().toISOString(),
    fcm_token: "",
    kakao_id: null,
    kakao_notification: true,
    push_notification: true,
    terms_agreed_at: new Date().toISOString(),
    app_settings: {},
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    full_name: "최믿음",
    avatar_url: "/images/defaultProfileImage.png",
    updated_at: new Date().toISOString(),
    username: "choi_faith",
    website: null,
    blocking_users: [],
    created_at: new Date().toISOString(),
    fcm_token: "",
    kakao_id: null,
    kakao_notification: true,
    push_notification: true,
    terms_agreed_at: new Date().toISOString(),
    app_settings: {},
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    full_name: "정소망",
    avatar_url: "/images/defaultProfileImage.png",
    updated_at: new Date().toISOString(),
    username: "jung_hope",
    website: null,
    blocking_users: [],
    created_at: new Date().toISOString(),
    fcm_token: "",
    kakao_id: null,
    kakao_notification: true,
    push_notification: true,
    terms_agreed_at: new Date().toISOString(),
    app_settings: {},
  },
];

// 목업 그룹 데이터
export const mockGroup: Group = {
  id: "650e8400-e29b-41d4-a716-446655440000",
  name: "청년부 기도모임",
  intro: "함께 기도하는 청년들",
  user_id: "550e8400-e29b-41d4-a716-446655440001",
  // 하드코딩해줘
  created_at: "2025-06-23T00:00:00.000Z",
  updated_at: "2025-06-23T00:00:00.000Z",
  deleted_at: null,
  group_union_id: null,
};

// 목업 멤버 데이터
export const mockMembers: MemberWithProfiles[] = [
  {
    id: "750e8400-e29b-41d4-a716-446655440001",
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    group_id: "650e8400-e29b-41d4-a716-446655440000",
    pray_summary:
      "새로운 일터에서의 적응과 동료들과의 관계를 위해 기도해 주세요",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    profiles: mockProfiles[0],
  },
  {
    id: "750e8400-e29b-41d4-a716-446655440002",
    user_id: "550e8400-e29b-41d4-a716-446655440002",
    group_id: "650e8400-e29b-41d4-a716-446655440000",
    pray_summary: "가족들의 건강과 화목을 위해 기도 부탁드립니다",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    profiles: mockProfiles[1],
  },
  {
    id: "750e8400-e29b-41d4-a716-446655440003",
    user_id: "550e8400-e29b-41d4-a716-446655440003",
    group_id: "650e8400-e29b-41d4-a716-446655440000",
    pray_summary: "진로 결정과 하나님의 뜻을 발견하기 위해",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    profiles: mockProfiles[2],
  },
  {
    id: "750e8400-e29b-41d4-a716-446655440004",
    user_id: "550e8400-e29b-41d4-a716-446655440004",
    group_id: "650e8400-e29b-41d4-a716-446655440000",
    pray_summary: "믿지 않는 가족들의 구원을 위해 기도해 주세요",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    profiles: mockProfiles[3],
  },
];

// 목업 기도카드 데이터
export const mockPrayCards: PrayCardWithProfiles[] = [
  {
    id: "850e8400-e29b-41d4-a716-446655440001",
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    group_id: "650e8400-e29b-41d4-a716-446655440000",
    content:
      "새로운 회사에 입사하게 되었어요! 적응할 수 있도록\n\n동료들과 좋은 관계를 맺을 수 있도록\n\n맡겨진 일을 잘 감당할 수 있는 지혜를 주시도록",
    life: "새로운 시작을 앞두고 기대와 걱정이 함께 있는 한 주였어요",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    bible_card_url: null,
    profiles: mockProfiles[0],
    pray: [], // 이후에 추가할 예정
    group: mockGroup,
  },
  {
    id: "850e8400-e29b-41d4-a716-446655440002",
    user_id: "550e8400-e29b-41d4-a716-446655440002",
    group_id: "650e8400-e29b-41d4-a716-446655440000",
    content:
      "아버지의 수술이 잘 되도록 기도해 주세요\n\n빠른 회복을 위해\n\n가족들이 힘을 낼 수 있도록",
    life: "가족의 건강 문제로 많이 걱정되는 한 주였습니다",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    bible_card_url: null,
    profiles: mockProfiles[1],
    pray: [],
    group: mockGroup,
  },
  {
    id: "850e8400-e29b-41d4-a716-446655440003",
    user_id: "550e8400-e29b-41d4-a716-446655440003",
    group_id: "650e8400-e29b-41d4-a716-446655440000",
    content:
      "대학원 진학을 할지 취업을 할지 고민이에요\n\n하나님의 뜻을 분별할 수 있는 지혜를\n\n어떤 길이든 하나님을 영화롭게 할 수 있도록",
    life: "인생의 중요한 갈림길에서 기도하며 기다리는 중입니다",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    bible_card_url: null,
    profiles: mockProfiles[2],
    pray: [],
    group: mockGroup,
  },
  {
    id: "850e8400-e29b-41d4-a716-446655440004",
    user_id: "550e8400-e29b-41d4-a716-446655440004",
    group_id: "650e8400-e29b-41d4-a716-446655440000",
    content:
      "믿지 않는 가족들에게 복음을 전할 기회가 있도록\n\n제가 먼저 좋은 본이 될 수 있도록\n\n가족들의 마음이 열리도록",
    life: "가족 전도를 위해 꾸준히 기도하며 섬기고 있어요",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    bible_card_url: null,
    profiles: mockProfiles[3],
    pray: [],
    group: mockGroup,
  },
  {
    id: "850e8400-e29b-41d4-a716-446655440005",
    user_id: "550e8400-e29b-41d4-a716-446655440005",
    group_id: "650e8400-e29b-41d4-a716-446655440000",
    content:
      "새로운 사역지에서의 적응을 위해\n\n현지 사람들과 좋은 관계를 맺을 수 있도록\n\n언어 습득이 빨리 될 수 있도록",
    life: "해외 선교지에서 첫 주를 보내며 많은 것을 배우고 있어요",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    bible_card_url: null,
    profiles: mockProfiles[4],
    pray: [],
    group: mockGroup,
  },
];

// 기도 반응 목업 데이터 생성 함수
export const generateMockPrays = (prayCardId: string): PrayWithProfiles[] => {
  const prays: PrayWithProfiles[] = [];
  const prayTypes = [PrayType.PRAY, PrayType.GOOD, PrayType.LIKE];

  // 각 멤버가 여러 번 반응
  mockProfiles.forEach((profile, userIndex) => {
    // 각 멤버마다 다른 수의 기도 반응 생성
    const prayCount = Math.floor(Math.random() * 4) + 3;

    for (let i = 0; i < prayCount; i++) {
      const randomPrayType =
        prayTypes[Math.floor(Math.random() * prayTypes.length)];
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 7)); // 최근 7일 내

      prays.push({
        id: `950e8400-e29b-41d4-a716-44665544${
          String(userIndex).padStart(2, "0")
        }${String(i).padStart(2, "0")}`,
        user_id: profile.id,
        pray_card_id: prayCardId,
        pray_type: randomPrayType,
        created_at: baseDate.toISOString(),
        updated_at: baseDate.toISOString(),
        deleted_at: null,
        profiles: profile,
      });
    }
  });

  return prays;
};

// 기도카드에 기도 반응 추가
export const mockPrayCardsWithPrays: PrayCardWithProfiles[] = mockPrayCards.map(
  (card) => ({
    ...card,
    pray: generateMockPrays(card.id),
  }),
);

// 현재 사용자 (김기도)
export const mockCurrentUser = mockProfiles[0];

// 현재 사용자의 멤버 정보
export const mockMyMember = mockMembers[0];

// 다른 멤버들 목록
export const mockOtherMembers = mockMembers.slice(1);

// 현재 사용자의 기도카드 목록 (MyMember 컴포넌트용)
export const mockUserPrayCardList = mockPrayCardsWithPrays.filter(
  (card) => card.user_id === mockCurrentUser.id,
);
