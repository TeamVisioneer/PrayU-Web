import { PrayType } from "@/Enums/prayType";
import { Database } from "./database";

export type Group = Database["public"]["Tables"]["group"]["Row"];

export type Member = Database["public"]["Tables"]["member"]["Row"];

export type Profiles = Database["public"]["Tables"]["profiles"]["Row"];

export type PrayCard = Database["public"]["Tables"]["pray_card"]["Row"];

export type Pray = Database["public"]["Tables"]["pray"]["Row"];

export type OriginNotification =
  Database["public"]["Tables"]["notification"]["Row"];
export type Notification = Omit<OriginNotification, "data" | "fcm_result"> & {
  data: unknown;
  fcm_result: unknown;
};

export interface GroupWithProfiles extends Group {
  profiles: Profiles;
}

export interface MemberWithGroup extends Member {
  group: Group;
}

export interface MemberWithProfiles extends Member {
  profiles: Profiles;
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
