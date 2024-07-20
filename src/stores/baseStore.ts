import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { supabase } from "../../supabase/client";
import { User } from "@supabase/supabase-js";
import {
  Group,
  Member,
  MemberWithProfiles,
  PrayCard,
  UserIdMemberHash,
  userIdPrayCardListHash,
} from "../../supabase/types/tables";
import { fetchGroupListByUserId, getGroup, createGroup } from "@/apis/group";
import { fetchMemberListByGroupId, createMember } from "@/apis/member";
import {
  createPrayCard,
  fetchPrayCardListByGroupId,
  fetchPrayCardListByUserId,
} from "@/apis/prayCard";

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
  groupPrayCardList: PrayCard[] | null;
  userPrayCardList: PrayCard[] | null;
  userIdPrayCardListHash: userIdPrayCardListHash | null;
  targetPrayCard: PrayCard | null;
  inputPrayCardContent: string;
  fetchPrayCardListByGroupId: (groupId: string | undefined) => Promise<void>;
  fetchPrayCardListByUserId: (userId: string | undefined) => Promise<void>;
  createUserIdPrayCardListHash: (
    memberList: MemberWithProfiles[],
    groupPrayCardList: PrayCard[]
  ) => userIdPrayCardListHash;
  createPrayCard: (
    groupId: string | undefined,
    userId: string | undefined,
    content: string
  ) => Promise<PrayCard | null>;
  setPrayCardContent: (content: string) => void;
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
      groupPrayCardList: PrayCard[]
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
  }))
);

export default useBaseStore;
