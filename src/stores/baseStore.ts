import {
  bulkFetchPrayDataByUserId,
  createPray,
  fetchIsPrayToday,
  fetchPrayData,
  fetchPrayDataByUserId,
} from "./../apis/pray";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { supabase } from "../../supabase/client";
import { User } from "@supabase/supabase-js";
import {
  Group,
  Member,
  MemberWithProfiles,
  Pray,
  PrayCard,
  PrayCardWithProfiles,
  UserIdMemberHash,
  userIdPrayCardListHash,
  prayCardIdPrayDataHash,
  TodayPrayTypeHash,
} from "../../supabase/types/tables";
import { fetchGroupListByUserId, getGroup, createGroup } from "@/apis/group";
import { fetchMemberListByGroupId, createMember } from "@/apis/member";
import {
  createPrayCard,
  fetchPrayCardListByGroupId,
  fetchPrayCardListByUserId,
} from "@/apis/prayCard";
import { PrayType } from "@/Enums/prayType";
import { getISOToday } from "@/lib/utils";

export interface BaseStore {
  // user
  user: User | null;
  userLoading: boolean;
  getUser: () => void;
  signOut: () => Promise<void>;

  // group
  groupList: Group[] | null;
  targetGroup: Group | null;
  inputGroupName: string;
  fetchGroupListByUserId: (userId: string | undefined) => Promise<void>;
  getGroup: (groupId: string | undefined) => Promise<void>;
  setGroupName: (groupName: string) => void;
  createGroup: (
    userId: string | undefined,
    name: string | undefined,
    intro: string | undefined
  ) => Promise<Group | null>;

  // member
  memberList: MemberWithProfiles[] | null;
  targetMember: Member | null;
  userIdMemberHash: UserIdMemberHash | null;
  fetchMemberListByGroupId: (groupId: string | undefined) => Promise<void>;
  createMember: (
    groupId: string | undefined,
    userId: string | undefined
  ) => Promise<Member | null>;

  // prayCard
  groupPrayCardList: PrayCardWithProfiles[] | null;
  userPrayCardList: PrayCardWithProfiles[] | null;
  userIdPrayCardListHash: userIdPrayCardListHash | null;
  targetPrayCard: PrayCardWithProfiles | null;
  inputPrayCardContent: string;
  fetchPrayCardListByGroupId: (groupId: string | undefined) => Promise<void>;
  fetchPrayCardListByUserId: (userId: string | undefined) => Promise<void>;
  createUserIdPrayCardListHash: (
    memberList: MemberWithProfiles[],
    groupPrayCardList: PrayCardWithProfiles[]
  ) => userIdPrayCardListHash;
  createPrayCard: (
    groupId: string | undefined,
    userId: string | undefined,
    content: string
  ) => Promise<PrayCard | null>;
  setPrayCardContent: (content: string) => void;

  //pray
  prayData: Pray[] | null;
  userPrayData: Pray[] | null;
  isPrayToday: boolean;
  setIsPrayToday: (isPrayToday: boolean) => void;
  todayPrayTypeHash: TodayPrayTypeHash;
  fetchPrayData: (prayCardId: string | undefined) => Promise<void>;
  fetchIsPrayToday: (userId: string | undefined) => Promise<void>;
  fetchPrayDataByUserId: (
    prayCardId: string | undefined,
    userId: string | undefined
  ) => Promise<void>;
  createPray: (
    prayCardId: string | undefined,
    userId: string | undefined,
    prayType: PrayType
  ) => Promise<Pray | null>;
  setTodayPrayType: (prayCardId: string, prayType: PrayType) => void;
}

const useBaseStore = create<BaseStore>()(
  immer((set) => ({
    // user
    user: null,
    userLoading: true,
    getUser: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      set((state) => {
        state.user = session?.user || null;
        state.userLoading = false;
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        set((state) => {
          state.user = session?.user || null;
        });
      });

      return () => {
        subscription?.unsubscribe();
      };
    },
    signOut: async () => {
      await supabase.auth.signOut();
      set((state) => {
        state.user = null;
      });
    },

    // group
    groupList: null,
    targetGroup: null,
    inputGroupName: "",
    fetchGroupListByUserId: async (userId: string | undefined) => {
      const data = await fetchGroupListByUserId(userId);
      set((state) => {
        state.groupList = data;
      });
    },
    getGroup: async (groupId: string | undefined) => {
      const data = await getGroup(groupId);
      set((state) => {
        state.targetGroup = data;
      });
    },
    createGroup: async (
      userId: string | undefined,
      name: string | undefined,
      intro: string | undefined
    ): Promise<Group | null> => {
      const group = await createGroup(userId, name, intro);
      set((state) => {
        state.targetGroup = group;
      });
      return group;
    },
    setGroupName: (groupName: string) => {
      set((state) => {
        state.inputGroupName = groupName;
      });
    },

    //member
    memberList: null,
    targetMember: null,
    userIdMemberHash: null,
    fetchMemberListByGroupId: async (groupId: string | undefined) => {
      const memberList = await fetchMemberListByGroupId(groupId);

      set((state) => {
        state.memberList = memberList;
      });
    },
    createMember: async (
      groupId: string | undefined,
      userId: string | undefined
    ): Promise<Member | null> => {
      const member = await createMember(groupId, userId);
      return member;
    },

    // prayCard
    groupPrayCardList: null,
    userPrayCardList: null,
    userIdPrayCardListHash: null,
    targetPrayCard: null,
    inputPrayCardContent: "",
    fetchPrayCardListByGroupId: async (groupId: string | undefined) => {
      const groupPrayCardList = await fetchPrayCardListByGroupId(groupId);
      set((state) => {
        state.groupPrayCardList = groupPrayCardList;
      });
    },
    fetchPrayCardListByUserId: async (userId: string | undefined) => {
      const userPrayCardList = await fetchPrayCardListByUserId(userId);
      set((state) => {
        state.userPrayCardList = userPrayCardList;
      });
    },
    createUserIdPrayCardListHash: (
      memberList: MemberWithProfiles[],
      groupPrayCardList: PrayCardWithProfiles[]
    ) => {
      const userIdPrayCardListHash = memberList.reduce((hash, member) => {
        hash[member.user_id || ""] = [];
        return hash;
      }, {} as userIdPrayCardListHash);
      groupPrayCardList.forEach((prayCard) => {
        userIdPrayCardListHash[prayCard.user_id || ""].push(prayCard);
      });
      set((state) => {
        state.userIdPrayCardListHash = userIdPrayCardListHash;
      });
      return userIdPrayCardListHash;
    },
    createPrayCard: async (
      groupId: string | undefined,
      userId: string | undefined,
      content: string
    ) => {
      const prayCard = await createPrayCard(groupId, userId, content);
      return prayCard;
    },
    setPrayCardContent: (content: string) => {
      set((state) => {
        state.inputPrayCardContent = content;
      });
    },

    // pray
    prayData: null,
    userPrayData: null,
    todayPrayTypeHash: {},
    isPrayToday: false,
    setIsPrayToday: (isPrayToday: boolean) => {
      set((state) => {
        state.isPrayToday = isPrayToday;
      });
    },
    fetchPrayData: async (prayCardId: string | undefined) => {
      const prayData = await fetchPrayData(prayCardId);
      set((state) => {
        state.prayData = prayData;
      });
    },
    fetchIsPrayToday: async (userId: string | undefined) => {
      const isPrayToday = await fetchIsPrayToday(userId);
      set((state) => {
        state.isPrayToday = isPrayToday;
      });
    },
    fetchPrayDataByUserId: async (
      prayCardId: string | undefined,
      userId: string | undefined
    ) => {
      const userPrayData = await fetchPrayDataByUserId(prayCardId, userId);
      const today = new Date(getISOToday());
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const todayPray = userPrayData?.find(
        (pray) =>
          pray.user_id === userId &&
          new Date(pray.created_at) >= startOfDay &&
          new Date(pray.created_at) <= endOfDay
      );
      set((state) => {
        state.userPrayData = userPrayData;
        state.todayPrayTypeHash[prayCardId!] =
          (todayPray?.pray_type as PrayType) || null;
      });
    },
    createPray: async (
      prayCardId: string | undefined,
      userId: string | undefined,
      prayType: PrayType
    ) => {
      const pray = await createPray(prayCardId, userId, prayType);
      set((state) => {
        state.todayPrayTypeHash[prayCardId!] = prayType;
      });
      return pray;
    },
    setTodayPrayType: (prayCardId: string, prayType: PrayType) => {
      set((state) => {
        state.todayPrayTypeHash[prayCardId] = prayType;
      });
    },
  }))
);

export default useBaseStore;
