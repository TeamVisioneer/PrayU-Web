import { PrayType } from "@/Enums/prayType";
import { Database } from "./database";

export type Group = Database["public"]["Tables"]["group"]["Row"];

export type Member = Database["public"]["Tables"]["member"]["Row"];

export type Profiles = Database["public"]["Tables"]["profiles"]["Row"];

export type PrayCard = Database["public"]["Tables"]["pray_card"]["Row"];

export type Pray = Database["public"]["Tables"]["pray"]["Row"];

export interface MemberWithGroup extends Member {
  group: Group;
}

export interface MemberWithProfiles extends Member {
  profiles: Profiles;
}

export interface PrayCardWithProfiles extends PrayCard {
  profiles: Profiles;
}

export interface UserIdMemberHash {
  [key: string]: MemberWithProfiles;
}

export interface userIdPrayCardListHash {
  [key: string]: PrayCardWithProfiles[];
}

export interface TodayPrayTypeHash {
  [prayCardId: string]: PrayType | null;
}

export interface PrayDataHash {
  [prayCardId: string]: Pray[] | null;
}
