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
import { fetchPrayCardListByGroupId } from "@/apis/prayCard";

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
  createGroup: (
    userId: string | undefined,
    name: string | undefined,
    intro: string | undefined
  ) => Promise<Group | null>;

  // member
  memberList: Member[] | null;
  targetMember: Member | null;
  userIdMemberHash: UserIdMemberHash | null;
  fetchMemberListByGroupId: (
    currentUserId: string | undefined,
    groupId: string | undefined
  ) => Promise<void>;
  createMember: (
    groupId: string | undefined,
    userId: string | undefined
  ) => Promise<Member | null>;
  setGroupName: (groupName: string) => void;

  // prayCard
  prayCardList: PrayCard[] | null;
  targetPrayCard: PrayCard | null;
  userIdPrayCardListHash: userIdPrayCardListHash | null;
  fetchPrayCardListByGroupId: (groupId: string | undefined) => Promise<void>;
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
    fetchMemberListByGroupId: async (
      currentUserId: string | undefined,
      groupId: string | undefined
    ) => {
      let memberList = await fetchMemberListByGroupId(groupId);
      const userIds = memberList?.map((member) => member.user_id);
      if (currentUserId && !userIds?.includes(currentUserId)) {
        await createMember(groupId, currentUserId);
        memberList = await fetchMemberListByGroupId(groupId);
      }
      const userIdMemberHash = memberList?.reduce(
        (hash, member: MemberWithProfiles) => {
          if (member.user_id) hash[member.user_id] = member;
          return hash;
        },
        {} as UserIdMemberHash
      );

      set((state) => {
        state.memberList = memberList;
        state.userIdMemberHash = userIdMemberHash || null;
      });
    },
    createMember: async (
      groupId: string | undefined,
      userId: string | undefined
    ): Promise<Member | null> => {
      const member = await createMember(groupId, userId);
      set((state) => {
        state.targetMember = member;
      });
      return member;
    },

    // prayCard
    prayCardList: null,
    targetPrayCard: null,
    userIdPrayCardListHash: null,
    fetchPrayCardListByGroupId: async (groupId: string | undefined) => {
      const prayCardList = await fetchPrayCardListByGroupId(groupId);
      const userIdPrayCardListHash = prayCardList?.reduce(
        (hash, prayCard: PrayCard) => {
          if (prayCard.user_id) hash[prayCard.user_id] = prayCard;
          return hash;
        },
        {} as userIdPrayCardListHash
      );
      set((state) => {
        state.prayCardList = prayCardList;
        state.userIdPrayCardListHash = userIdPrayCardListHash || null;
      });
    },
  }))
);

export default useBaseStore;
