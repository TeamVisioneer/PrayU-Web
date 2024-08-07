import { createPray, fetchIsPrayToday } from "./../apis/pray";
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
  TodayPrayTypeHash,
  PrayWithProfiles,
} from "../../supabase/types/tables";
import {
  fetchGroupListByUserId,
  getGroup,
  createGroup,
  deleteGroup,
} from "@/apis/group";
import {
  createMember,
  deleteMemberbyGroupId,
  fetchMemberListByGroupId,
  getMember,
  updateMember,
} from "@/apis/member";
import {
  createPrayCard,
  deletePrayCard,
  deletePrayCardByGroupId,
  fetchGroupPrayCardList,
  fetchOtherPrayCardListByGroupId,
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

  fetchGroupListByUserId: (userId: string) => Promise<void>;
  getGroup: (groupId: string) => Promise<void>;
  setGroupName: (groupName: string) => void;
  setIsDisabledGroupCreateBtn: (isDisabled: boolean) => void;
  createGroup: (
    userId: string,
    name: string,
    intro: string
  ) => Promise<Group | null>;
  isOpenTodayPrayDrawer: boolean;
  setIsOpenTodayPrayDrawer: (isOpenTodayPrayDrawer: boolean) => void;

  // member
  memberList: MemberWithProfiles[] | null;
  memberLoading: boolean;
  targetMember: MemberWithProfiles | null;
  fetchMemberListByGroupId: (groupId: string) => Promise<void>;
  createMember: (
    groupId: string,
    userId: string,
    praySummary: string
  ) => Promise<Member | null>;
  updateMember: (
    memberId: string,
    praySummary: string,
    updatedAt?: string
  ) => Promise<Member | null>;
  getMember: (
    userId: string,
    groupId: string
  ) => Promise<MemberWithProfiles | null>;
  isOpenMyMemberDrawer: boolean;
  setIsOpenMyMemberDrawer: (isOpenMyMemberDrawer: boolean) => void;
  deleteMemberbyGroupId: (
    userId: string,
    groupId: string,
    numMember: number
  ) => Promise<void>;

  // prayCard
  groupPrayCardList: PrayCardWithProfiles[] | null;
  otherPrayCardList: PrayCardWithProfiles[] | null;
  userPrayCardList: PrayCardWithProfiles[] | null;
  targetPrayCard: PrayCardWithProfiles | null;
  inputPrayCardContent: string;
  isEditingPrayCard: boolean;
  isDisabledPrayCardCreateBtn: boolean;
  prayCardCarouselApi: CarouselApi | null;
  setGroupPrayCardList: (groupPrayCardList: PrayCardWithProfiles[]) => void;
  fetchGroupPrayCardList: (
    groupId: string,
    currentUserId: string,
    startDt: string,
    endDt: string
  ) => Promise<PrayCardWithProfiles[] | null>;
  setOtherPrayCardList: (otherPrayCardList: PrayCardWithProfiles[]) => void;
  fetchOtherPrayCardListByGroupId: (
    currentUserId: string,
    userId: string,
    groupId: string
  ) => Promise<PrayCardWithProfiles[] | null>;
  fetchUserPrayCardListByGroupId: (
    currentUserId: string,
    groupId: string
  ) => Promise<PrayCardWithProfiles[] | null>;
  createPrayCard: (
    groupId: string,
    userId: string,
    content: string
  ) => Promise<PrayCard | null>;
  setIsEditingPrayCard: (isEditingPrayCard: boolean) => void;
  setIsDisabledPrayCardCreateBtn: (
    isDisabledPrayCardCreateBtn: boolean
  ) => void;
  updatePrayCardContent: (prayCardId: string, content: string) => Promise<void>;
  setPrayCardContent: (content: string) => void;
  setPrayCardCarouselApi: (prayCardCarouselApi: CarouselApi) => void;
  deletePrayCard: (prayCardId: string) => Promise<void>;
  deletePrayCardByGroupId: (userId: string, groupId: string) => Promise<void>;

  // pray
  todayPrayTypeHash: TodayPrayTypeHash;
  isPrayToday: boolean | null;
  setIsPrayToday: (isPrayToday: boolean) => void;
  fetchIsPrayToday: (userId: string, groupId: string) => Promise<void>;
  createPray: (
    prayCardId: string,
    userId: string,
    prayType: PrayType
  ) => Promise<Pray | null>;
  groupAndSortByUserId: (data: PrayWithProfiles[]) => {
    [key: string]: PrayWithProfiles[];
  };

  isOpenMyPrayDrawer: boolean;
  setIsOpenMyPrayDrawer: (isOpenTodayPrayDrawer: boolean) => void;

  // share
  isOpenShareDrawer: boolean;
  setIsOpenShareDrawer: (isOpenShareDrawer: boolean) => void;

  // etc
  isConfirmAlertOpen: boolean;
  setIsConfirmAlertOpen: (isGroupAlertOpen: boolean) => void;

  alertData: {
    title: string;
    description: string;
    cancelText: string;
    actionText: string;
    onAction: () => void;
  };
  setAlertData: (alertData: {
    title: string;
    description: string;
    cancelText: string;
    actionText: string;
    onAction: () => void;
  }) => void;
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
        // Sentry, Event 설정
        if (
          import.meta.env.VITE_ENV === "staging" ||
          import.meta.env.VITE_ENV === "prod"
        ) {
          Sentry.setUser({
            id: session?.user.id,
            email: session?.user.email,
          });
          analytics.identify(session?.user.id || "", {
            email: session?.user.user_metadata?.email,
            full_name: session?.user.user_metadata?.full_name,
            user_name: session?.user.user_metadata?.user_name,
          });
        }
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
    fetchGroupListByUserId: async (userId: string) => {
      const data = await fetchGroupListByUserId(userId);
      set((state) => {
        state.groupList = data;
      });
    },
    getGroup: async (groupId: string) => {
      const data = await getGroup(groupId);
      set((state) => {
        state.targetGroup = data;
      });
    },
    createGroup: async (
      userId: string,
      name: string,
      intro: string
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
    fetchMemberListByGroupId: async (groupId: string) => {
      const memberList = await fetchMemberListByGroupId(groupId);
      set((state) => {
        state.memberList = memberList;
      });
    },
    createMember: async (
      groupId: string,
      userId: string,
      praySummay: string
    ): Promise<Member | null> => {
      const member = await createMember(groupId, userId, praySummay);
      return member;
    },
    updateMember: async (memberId: string, praySummary, updatedAt?: string) => {
      let member;
      if (updatedAt) {
        member = await updateMember(memberId, praySummary, updatedAt);
      } else {
        member = await updateMember(memberId, praySummary);
      }
      return member;
    },
    getMember: async (userId: string, groupId: string) => {
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
    deleteMemberbyGroupId: async (
      userId: string,
      groupId: string,
      numMember: number
    ) => {
      if (numMember <= 1) {
        await deleteGroup(groupId);
      }
      await deleteMemberbyGroupId(userId, groupId);
    },

    // prayCard
    groupPrayCardList: null,
    userPrayCardList: null,
    otherPrayCardList: null,
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
    setGroupPrayCardList: (groupPrayCardList: PrayCardWithProfiles[]) => {
      set((state) => {
        state.groupPrayCardList = groupPrayCardList;
      });
    },
    fetchGroupPrayCardList: async (
      groupId: string,
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
      const today = new Date(getISOToday());
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      set((state) => {
        state.groupPrayCardList = groupPrayCardList;
        groupPrayCardList?.forEach((prayCard) => {
          const todayPray = prayCard.pray.find(
            (pray) =>
              pray.user_id === currentUserId &&
              new Date(pray.created_at) >= startOfDay &&
              new Date(pray.created_at) <= endOfDay
          );
          state.todayPrayTypeHash[prayCard.id] = todayPray
            ? (todayPray.pray_type as PrayType)
            : null;
        });
      });
      return groupPrayCardList;
    },
    setOtherPrayCardList: (otherPrayCardList: PrayCardWithProfiles[]) => {
      set((state) => {
        state.otherPrayCardList = otherPrayCardList;
      });
    },
    fetchOtherPrayCardListByGroupId: async (
      currentUserId: string,
      userId: string,
      groupId: string
    ) => {
      const otherPrayCardList = await fetchOtherPrayCardListByGroupId(
        currentUserId,
        userId,
        groupId
      );
      const today = new Date(getISOToday());
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      set((state) => {
        state.otherPrayCardList = otherPrayCardList;
        otherPrayCardList?.forEach((prayCard) => {
          const todayPray = prayCard.pray.find(
            (pray) =>
              pray.user_id === currentUserId &&
              new Date(pray.created_at) >= startOfDay &&
              new Date(pray.created_at) <= endOfDay
          );
          state.todayPrayTypeHash[prayCard.id] = todayPray
            ? (todayPray.pray_type as PrayType)
            : null;
        });
      });
      return otherPrayCardList;
    },
    fetchUserPrayCardListByGroupId: async (
      currentUserId: string,
      groupId: string
    ) => {
      const userPrayCardList = await fetchUserPrayCardListByGroupId(
        currentUserId,
        groupId
      );
      set((state) => {
        state.userPrayCardList = userPrayCardList;
      });
      return userPrayCardList;
    },
    createPrayCard: async (
      groupId: string,
      userId: string,
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
    deletePrayCard: async (prayCardId: string) => {
      await deletePrayCard(prayCardId);
    },
    deletePrayCardByGroupId: async (userId: string, groupId: string) => {
      await deletePrayCardByGroupId(userId, groupId);
    },

    // pray
    todayPrayTypeHash: {},
    isPrayToday: null,
    setIsPrayToday: (isPrayToday: boolean) => {
      set((state) => {
        state.isPrayToday = isPrayToday;
      });
    },
    fetchIsPrayToday: async (userId: string, groupId: string) => {
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

    createPray: async (
      prayCardId: string,
      userId: string,
      prayType: PrayType
    ) => {
      const pray = await createPray(prayCardId, userId, prayType);
      set((state) => {
        state.todayPrayTypeHash[prayCardId] = prayType;
      });
      return pray;
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

    // etc
    isConfirmAlertOpen: false,
    setIsConfirmAlertOpen(isGroupAlertOpen) {
      set((state) => {
        state.isConfirmAlertOpen = isGroupAlertOpen;
      });
    },
    alertData: {
      title: "",
      description: "",
      cancelText: "",
      actionText: "",
      onAction: () => {},
    },
    setAlertData: (alertData) => {
      set((state) => {
        state.alertData = alertData;
      });
    },
  }))
);

export default useBaseStore;
