import { PrayType } from "@/Enums/prayType";
import { Database } from "./database";

export type Group = Database["public"]["Tables"]["group"]["Row"];

export type Member = Database["public"]["Tables"]["member"]["Row"];

export type OriginProfiles = Database["public"]["Tables"]["profiles"]["Row"];

export type PrayCard = Database["public"]["Tables"]["pray_card"]["Row"];

export type Pray = Database["public"]["Tables"]["pray"]["Row"];

export type Bible = Database["public"]["Tables"]["bible"]["Row"];

export type QtData = Database["public"]["Tables"]["qt_data"]["Row"];

export type GroupUnion = Database["public"]["Tables"]["group_union"]["Row"];

export type OriginNotification =
  Database["public"]["Tables"]["notification"]["Row"];
export type Notification = Omit<OriginNotification, "data" | "fcm_result"> & {
  data: unknown;
  fcm_result: unknown;
};

export type Profiles = Omit<OriginProfiles, "app_settings"> & {
  app_settings?: AppSettings;
};

// App Settings 타입 정의
export interface AppSettings {
  fontSize?: "small" | "medium" | "large";
  // 향후 추가될 설정들
  theme?: "light" | "dark" | "auto";
  notifications?: {
    push?: boolean;
    prayer?: boolean;
    reminder?: boolean;
  };
  // 필요에 따라 추가
}

// App Settings 기본값
export const DEFAULT_APP_SETTINGS: AppSettings = {
  fontSize: "small",
  theme: "light",
  notifications: {
    push: true,
    prayer: true,
    reminder: true,
  },
};

export interface GroupUnionWithProfiles extends GroupUnion {
  profiles: Profiles;
}

export interface GroupWithProfiles extends Group {
  profiles?: Profiles;
  member?: MemberWithProfiles[];
  group_union?: GroupUnionWithProfiles;
}

export interface MemberWithGroup extends Member {
  group: Group;
}

export interface MemberWithProfiles extends Member {
  profiles: Profiles;
}

export interface MemberWithGroup extends Member {
  group: Group;
}

export interface PrayCardWithProfiles extends PrayCard {
  profiles: Profiles;
  pray: PrayWithProfiles[];
  group?: Group;
}

export interface PrayWithProfiles extends Pray {
  profiles: Profiles;
}

export interface TodayPrayTypeHash {
  [prayCardId: string]: PrayType | null;
}

export interface PrayWithPrayCard extends Pray {
  pray_card: PrayCard;
}
