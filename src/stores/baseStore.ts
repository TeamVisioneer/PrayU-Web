import {
  createPray,
  fetchIsPrayToday,
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
  TodayPrayTypeHash,
  PrayDataHash,
  PrayWithProfiles,
} from "../../supabase/types/tables";
import { fetchGroupListByUserId, getGroup, createGroup } from "@/apis/group";
import {
  createMember,
  fetchMemberListByGroupId,
  getMember,
  updateMember,
} from "@/apis/member";
import {
  createPrayCard,
  fetchGroupPrayCardList,
  fetchUserPrayCardListByGroupId,
  updatePrayCardContent,
} from "@/apis/prayCard";
import { PrayType } from "@/Enums/prayType";
import { getISOToday } from "@/lib/utils";
import { type CarouselApi } from "@/components/ui/carousel";
import * as Sentry from "@sentry/react";
import { analytics } from "@/analytics/analytics";

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
  isDisabledGroupCreateBtn: boolean;
  fetchGroupListByUserId: (userId: string | undefined) => Promise<void>;
  getGroup: (groupId: string | undefined) => Promise<void>;
  setGroupName: (groupName: string) => void;
  setIsDisabledGroupCreateBtn: (isDisabled: boolean) => void;
  createGroup: (
    userId: string | undefined,
    name: string | undefined,
    intro: string | undefined
  ) => Promise<Group | null>;
  isOpenTodayPrayDrawer: boolean;
  setIsOpenTodayPrayDrawer: (isOpenTodayPrayDrawer: boolean) => void;

  // member
  memberList: MemberWithProfiles[] | null;
  memberLoading: boolean;
  targetMember: MemberWithProfiles | null;
  userIdMemberHash: UserIdMemberHash | null;
  fetchMemberListByGroupId: (groupId: string | undefined) => Promise<void>;
  createMember: (
    groupId: string | undefined,
    userId: string | undefined
  ) => Promise<Member | null>;
  updateMember: (
    memberId: string | undefined,
    praySummary: string,
    updatedAt?: string
  ) => Promise<Member | null>;
  getMember: (
    userId: string,
    groupId: string | undefined
  ) => Promise<MemberWithProfiles | null>;
  isOpenMyMemberDrawer: boolean;
  setIsOpenMyMemberDrawer: (isOpenMyMemberDrawer: boolean) => void;

  // prayCard
  groupPrayCardList: PrayCardWithProfiles[] | null;
  userPrayCardList: PrayCardWithProfiles[] | null;
  targetPrayCard: PrayCardWithProfiles | null;
  inputPrayCardContent: string;
  isEditingPrayCard: boolean;
  isDisabledPrayCardCreateBtn: boolean;
  prayCardCarouselApi: CarouselApi | null;
  fetchGroupPrayCardList: (
    groupId: string | undefined,
    currentUserId: string,
    startDt: string,
    endDt: string
  ) => Promise<void>;
  fetchUserPrayCardListByGroupId: (
    userId: string | undefined,
    groupId: string | undefined
  ) => Promise<void>;
  createPrayCard: (
    groupId: string | undefined,
    userId: string | undefined,
    content: string
  ) => Promise<PrayCard | null>;
  setIsEditingPrayCard: (isEditingPrayCard: boolean) => void;
  setIsDisabledPrayCardCreateBtn: (
    isDisabledPrayCardCreateBtn: boolean
  ) => void;
  updatePrayCardContent: (prayCardId: string, content: string) => Promise<void>;
  setPrayCardContent: (content: string) => void;
  setPrayCardCarouselApi: (prayCardCarouselApi: CarouselApi) => void;

  // pray
  prayData: Pray[] | null;
  prayDataHash: PrayDataHash;
  todayPrayTypeHash: TodayPrayTypeHash;
  isPrayToday: boolean;
  reactionCounts: { [key in PrayType]?: number };
  prayerList: { [key: string]: PrayWithProfiles[] } | null;
  setIsPrayToday: (isPrayToday: boolean) => void;
  fetchIsPrayToday: (
    userId: string | undefined,
    groupId: string | undefined
  ) => Promise<void>;
  fetchPrayDataByUserId: (
    prayCardId: string | undefined,
    userId: string | undefined
  ) => Promise<void>;
  createPray: (
    prayCardId: string | undefined,
    userId: string | undefined,
    prayType: PrayType
  ) => Promise<Pray | null>;
  groupAndSortByUserId: (data: PrayWithProfiles[]) => {
    [key: string]: PrayWithProfiles[];
  };
  setReactionDatasForMe: (prayData: PrayWithProfiles[]) => void;

  isOpenMyPrayDrawer: boolean;
  setIsOpenMyPrayDrawer: (isOpenTodayPrayDrawer: boolean) => void;

  // share
  isOpenShareDrawer: boolean;
  setIsOpenShareDrawer: (isOpenShareDrawer: boolean) => void;
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
        if (state.user) {
          analytics.identify(state.user?.id, {
            email: state.user?.user_metadata?.email,
            full_name: state.user?.user_metadata?.full_name,
            user_name: state.user?.user_metadata?.user_name,
          });
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        set((state) => {
          state.user = session?.user || null;
          if (state.user) {
            analytics.identify(state.user?.id, {
              email: state.user?.user_metadata?.email,
              full_name: state.user?.user_metadata?.full_name,
              user_name: state.user?.user_metadata?.user_name,
            });
          }
        });
        // Sentry 설정
        if (
          import.meta.env.VITE_ENV === "staging" ||
          import.meta.env.VITE_ENV === "prod"
        )
          Sentry.setUser({
            id: session?.user.id,
            email: session?.user.email,
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
    isDisabledGroupCreateBtn: false,
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
        state.isDisabledGroupCreateBtn = groupName.trim() === "";
      });
    },
    setIsDisabledGroupCreateBtn: (isDisabled: boolean) => {
      set((state) => {
        state.isDisabledGroupCreateBtn = isDisabled;
      });
    },
    isOpenTodayPrayDrawer: false,
    setIsOpenTodayPrayDrawer: (isOpenTodayPrayDrawer: boolean) => {
      set((state) => {
        state.isOpenTodayPrayDrawer = isOpenTodayPrayDrawer;
      });
    },

    //member
    memberList: null,
    memberLoading: true,
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
    updateMember: async (
      memberId: string | undefined,
      praySummary,
      updatedAt?: string
    ) => {
      let member;
      if (updatedAt) {
        member = await updateMember(memberId, praySummary, updatedAt);
      } else {
        member = await updateMember(memberId, praySummary);
      }
      return member;
    },
    getMember: async (userId: string, groupId: string | undefined) => {
      const member = await getMember(userId, groupId);
      set((state) => {
        state.targetMember = member;
        state.memberLoading = false;
      });
      return member;
    },
    isOpenMyMemberDrawer: false,
    setIsOpenMyMemberDrawer: (isOpenMyMemberDrawer: boolean) => {
      set((state) => {
        state.isOpenMyMemberDrawer = isOpenMyMemberDrawer;
      });
    },

    // prayCard
    groupPrayCardList: null,
    userPrayCardList: null,
    targetPrayCard: null,
    inputPrayCardContent: "",
    isEditingPrayCard: false,
    isDisabledPrayCardCreateBtn: false,
    prayCardCarouselApi: null,
    setIsEditingPrayCard: (isEditingPrayCard: boolean) => {
      set((state) => {
        state.isEditingPrayCard = isEditingPrayCard;
      });
    },
    fetchGroupPrayCardList: async (
      groupId: string | undefined,
      currentUserId: string,
      startDt: string,
      endDt: string
    ) => {
      const groupPrayCardList = await fetchGroupPrayCardList(
        groupId,
        currentUserId,
        startDt,
        endDt
      );
      set((state) => {
        state.groupPrayCardList = groupPrayCardList;
      });
    },
    fetchUserPrayCardListByGroupId: async (
      userId: string | undefined,
      groupId: string | undefined
    ) => {
      const userPrayCardList = await fetchUserPrayCardListByGroupId(
        userId,
        groupId
      );
      set((state) => {
        state.userPrayCardList = userPrayCardList;
      });
    },
    createPrayCard: async (
      groupId: string | undefined,
      userId: string | undefined,
      content: string
    ) => {
      const prayCard = await createPrayCard(groupId, userId, content);
      return prayCard;
    },
    updatePrayCardContent: async (prayCardId: string, content: string) => {
      await updatePrayCardContent(prayCardId, content);
      set((state) => {
        state.inputPrayCardContent = content;
        state.isEditingPrayCard = false;
      });
    },
    setPrayCardContent: (content: string) => {
      set((state) => {
        state.inputPrayCardContent = content;
        state.isDisabledPrayCardCreateBtn = content.trim() === "";
      });
    },
    setIsDisabledPrayCardCreateBtn: (isDisabled: boolean) => {
      set((state) => {
        state.isDisabledPrayCardCreateBtn = isDisabled;
      });
    },
    setPrayCardCarouselApi: (prayCardCarouselApi: CarouselApi) => {
      set((state) => {
        state.prayCardCarouselApi = prayCardCarouselApi;
      });
    },
    setIsEditing: () => {
      set((state) => {
        state.isEditingPrayCard = true;
      });
    },

    // pray
    prayData: null,
    prayDataHash: {},
    todayPrayTypeHash: {},
    isPrayToday: false,
    reactionCounts: {
      [PrayType.PRAY]: 0,
      [PrayType.GOOD]: 0,
      [PrayType.LIKE]: 0,
    },
    prayerList: null,

    setIsPrayToday: (isPrayToday: boolean) => {
      set((state) => {
        state.isPrayToday = isPrayToday;
      });
    },

    fetchIsPrayToday: async (
      userId: string | undefined,
      groupId: string | undefined
    ) => {
      const isPrayToday = await fetchIsPrayToday(userId, groupId);
      set((state) => {
        state.isPrayToday = isPrayToday;
      });
    },
    groupAndSortByUserId: (data: PrayWithProfiles[]) => {
      const hash: { [key: string]: PrayWithProfiles[] } = {};

      data.forEach((item) => {
        if (!hash[item.user_id!]) {
          hash[item.user_id!] = [];
        }
        hash[item.user_id!].push(item);
      });

      const sortedEntries = Object.entries(hash).sort(
        (a, b) => b[1].length - a[1].length
      );

      const sortedHash = sortedEntries.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as { [key: string]: PrayWithProfiles[] });

      return sortedHash;
    },
    fetchPrayDataByUserId: async (
      prayCardId: string | undefined,
      userId: string | undefined
    ) => {
      const prayData = await fetchPrayDataByUserId(prayCardId, userId);

      if (prayData) {
        set((state) => {
          state.prayerList = state.groupAndSortByUserId(prayData);
          Object.values(PrayType).forEach((type) => {
            state.reactionCounts[type] = prayData.filter(
              (pray) => pray.pray_type === type
            ).length;
          });
        });
      }

      const today = new Date(getISOToday());
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      const todayPray = prayData?.find(
        (pray) =>
          pray.user_id === userId &&
          new Date(pray.created_at) >= startOfDay &&
          new Date(pray.created_at) <= endOfDay
      );
      set((state) => {
        state.prayDataHash[prayCardId!] = prayData;
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
    setReactionDatasForMe: (prayData: PrayWithProfiles[]) => {
      if (prayData)
        set((state) => {
          state.prayerList = state.groupAndSortByUserId(prayData);
          Object.values(PrayType).forEach((type) => {
            state.reactionCounts[type] = prayData.filter(
              (pray) => pray.pray_type === type
            ).length;
          });
        });
    },
    isOpenMyPrayDrawer: false,
    setIsOpenMyPrayDrawer: (isOpenTodayPrayDrawer: boolean) => {
      set((state) => {
        state.isOpenMyPrayDrawer = isOpenTodayPrayDrawer;
      });
    },

    // share
    isOpenShareDrawer: false,
    setIsOpenShareDrawer: (isOpenShareDrawer: boolean) => {
      set((state) => {
        state.isOpenShareDrawer = isOpenShareDrawer;
      });
    },
  }))
);

export default useBaseStore;
