import { PrayCardWithProfiles, Profiles } from "supabase/types/tables";

export const dummyPrayCard = {
  id: "1",
  user_id: "1",
  created_at: new Date().toISOString(),
  life: "(예시) 회사에서 업무적, 관계적으로 힘들었던 한 주",
  content:
    "(예시)PrayU 를 통해 많은 사람들이 기도할 수 있도록 🙏🏻\n\n(예시)맡겨진 자리에서 하나님의 사명을 발견할 수 있도록\n\n(예시)내 주변 사람을 내 몸과 같이 섬길 수 있도록",
  pray: [],
  profiles: {
    id: "1",
    full_name: "기도 카드",
    avatar_url: "/images/avatar/avatar_1.png",
  } as Profiles,
  bible_card_id: null,
  bible_card_url: "",
  deleted_at: "",
  group_id: "",
  updated_at: "",
} as PrayCardWithProfiles;

export const dummyPrayCard2 = {
  id: "1",
  user_id: "1",
  created_at: new Date().toISOString(),
  life: "가족들과 좋은 시간을 보내고 있어요",
  content: "말씀과 기도를 더욱 붙잡을 수 있도록",
  pray: [],
  profiles: {
    id: "1",
    full_name: "기도 카드",
    avatar_url: "/images/avatar/avatar_1.png",
  } as Profiles,
  bible_card_id: null,
  bible_card_url: "",
  deleted_at: "",
  group_id: "",
  updated_at: "",
} as PrayCardWithProfiles;
