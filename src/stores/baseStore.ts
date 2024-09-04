import { createPray, fetchIsPrayToday, updatePray } from "./../apis/pray";
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
  Profiles,
} from "../../supabase/types/tables";
import { fetchGroupListByUserId, getGroup, createGroup } from "@/apis/group";
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
import { updateProfile } from "@/apis/profiles";
import { Friend } from "@/components/kakao/Kakao";
import { KakaoController } from "@/components/kakao/KakaoController";

export interface BaseStore {
  // user
  user: User | null;
  userLoading: boolean;
  userPlan: string;
  getUser: () => void;
  signOut: () => Promise<void>;
  setUserPlan: (userId: string) => void;
  updateProfile: (userId: string, kakaoId: string) => Promise<Profiles | null>;
  kakaoFriendList: Friend[];
  fetchKakaoFriendList: () => void;

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
  isOpenGroupMenuSheet: boolean;
  setIsOpenGroupMenuSheet: (isOpenGroupMenuSheet: boolean) => void;

  // member
  memberList: MemberWithProfiles[] | null;
  memberLoading: boolean;
  myMember: MemberWithProfiles | null;
  otherMember: MemberWithProfiles | null;
  isOpenOtherMemberDrawer: boolean;
  setIsOpenOtherMemberDrawer: (isOpenOtherMemberDrawer: boolean) => void;
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
  setOtherMember: (member: MemberWithProfiles | null) => void;
  isOpenMyMemberDrawer: boolean;
  setIsOpenMyMemberDrawer: (isOpenMyMemberDrawer: boolean) => void;
  deleteMemberbyGroupId: (userId: string, groupId: string) => Promise<void>;

  // prayCard
  groupPrayCardList: PrayCardWithProfiles[] | null;
  otherPrayCardList: PrayCardWithProfiles[] | null;
  userPrayCardList: PrayCardWithProfiles[] | null;
  targetPrayCard: PrayCardWithProfiles | null;
  inputPrayCardContent: string;
  isEditingPrayCard: boolean;
  isDisabledPrayCardCreateBtn: boolean;
  prayCardCarouselApi: CarouselApi | null;
  fetchGroupPrayCardList: (
    groupId: string,
    currentUserId: string,
    startDt: string,
    endDt: string
  ) => Promise<PrayCardWithProfiles[] | null>;
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
  updatePray: (
    prayCardId: string | undefined,
    userId: string | undefined,
    prayType: PrayType
  ) => Promise<Pray | null>;
  groupAndSortByUserId: (data: PrayWithProfiles[]) => {
    [key: string]: PrayWithProfiles[];
  };

  isOpenMyPrayDrawer: boolean;
  setIsOpenMyPrayDrawer: (isOpenTodayPrayDrawer: boolean) => void;

  // share
  isOpenShareDrawer: boolean;
  isOpenContentDrawer: boolean;
  setIsOpenShareDrawer: (isOpenShareDrawer: boolean) => void;
  setIsOpenContentDrawer: (isContentShareDrawer: boolean) => void;

  // event
  isOpenEventDialog: boolean;
  setIsOpenEventDialog: (isOpenEventDialog: boolean) => void;

  // etc
  isConfirmAlertOpen: boolean;
  setIsConfirmAlertOpen: (isGroupAlertOpen: boolean) => void;

  isDefaultAlertOpen: boolean;
  setIsDefaultAlertOpen: (isDefaultAlertOpen: boolean) => void;

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
    userPlan: "",
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
        if (!session) {
          set((state) => {
            state.user = null;
          });
          return;
        }
        set((state) => {
          state.user = session.user;
        });

        // Sentry, Event 설정
        const ENV = import.meta.env.VITE_ENV;
        const WEB_VERSION = import.meta.env.WEB_VERSION;
        const userId = session.user.id;
        const { email, full_name, user_name } = session.user.user_metadata;

        if (ENV === "staging" || ENV === "prod") {
          Sentry.setUser({
            WEB_VERSION: WEB_VERSION,
            id: userId,
            email: email,
            user_name: user_name,
          });
          analytics.identify(session.user.id, {
            WEB_VERSION: WEB_VERSION,
            email: email,
            full_name: full_name,
            user_name: user_name,
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
    // TODO: 나중에 여기에 api를 가져와서 쓰면 될 것 같다.
    setUserPlan: (userId: string) => {
      if (!import.meta.env.VITE_PREMIUM_PLAN_USERLIST) {
        return null;
      }
      const userList = import.meta.env.VITE_PREMIUM_PLAN_USERLIST.split(
        ","
      ).reduce((acc: Record<string, string>, item: string) => {
        const [userId, userName] = item.split(":");
        acc[userId] = userName;
        return acc;
      }, {} as Record<string, string>);

      set((state) => {
        if (userId in userList) {
          state.userPlan = "Premium";
        }
        return state;
      });
    },
    updateProfile: async (
      userId: string,
      kakaoId: string
    ): Promise<Profiles | null> => {
      const profile = await updateProfile(userId, kakaoId);
      return profile;
    },

    kakaoFriendList: [],
    fetchKakaoFriendList: async () => {
      const response = await KakaoController.fetchFriends();
      set((state) => {
        if (response) state.kakaoFriendList = response.elements;
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
    isOpenGroupMenuSheet: false,
    setIsOpenGroupMenuSheet: (isOpenGroupMenuSheet: boolean) => {
      set((state) => {
        state.isOpenGroupMenuSheet = isOpenGroupMenuSheet;
      });
    },

    //member
    memberList: null,
    memberLoading: true,
    myMember: null,
    otherMember: null,
    isOpenOtherMemberDrawer: false,
    setIsOpenOtherMemberDrawer: (isOpenOtherMemberDrawer: boolean) => {
      set((state) => {
        state.isOpenOtherMemberDrawer = isOpenOtherMemberDrawer;
      });
    },
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
        state.myMember = member;
        state.memberLoading = false;
      });
      return member;
    },
    setOtherMember: (member: MemberWithProfiles | null) => {
      set((state) => {
        state.otherMember = member;
      });
    },
    isOpenMyMemberDrawer: false,
    setIsOpenMyMemberDrawer: (isOpenMyMemberDrawer: boolean) => {
      set((state) => {
        state.isOpenMyMemberDrawer = isOpenMyMemberDrawer;
      });
    },
    deleteMemberbyGroupId: async (userId: string, groupId: string) => {
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
          if (!state.todayPrayTypeHash[prayCard.id]) {
            const todayPray = prayCard.pray.find(
              (pray) =>
                pray.user_id === currentUserId &&
                new Date(pray.created_at) >= startOfDay &&
                new Date(pray.created_at) <= endOfDay
            );
            state.todayPrayTypeHash[prayCard.id] = todayPray
              ? (todayPray.pray_type as PrayType)
              : null;
          }
        });
      });
      return groupPrayCardList;
    },
    fetchOtherPrayCardListByGroupId: async (
      currentUserId: string,
      userId: string,
      groupId: string
    ) => {
      set((state) => {
        state.otherPrayCardList = null;
      });
      const otherPrayCardList = await fetchOtherPrayCardListByGroupId(
        currentUserId,
        userId,
        groupId
      );
      const today = new Date(getISOToday());
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      set((state) => {
        otherPrayCardList?.forEach((prayCard) => {
          if (!state.todayPrayTypeHash[prayCard.id]) {
            const todayPray = prayCard.pray.find(
              (pray) =>
                pray.user_id === currentUserId &&
                new Date(pray.created_at) >= startOfDay &&
                new Date(pray.created_at) <= endOfDay
            );
            state.todayPrayTypeHash[prayCard.id] = todayPray
              ? (todayPray.pray_type as PrayType)
              : null;
          }
        });
        state.otherPrayCardList = otherPrayCardList;
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
    updatePray: async (
      prayCardId: string | undefined,
      userId: string | undefined,
      prayType: PrayType
    ) => {
      const pray = await updatePray(prayCardId, userId, prayType);
      set((state) => {
        state.todayPrayTypeHash[prayCardId!] = prayType;
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
    isOpenContentDrawer: false,
    setIsOpenShareDrawer: (isOpenShareDrawer: boolean) => {
      set((state) => {
        state.isOpenShareDrawer = isOpenShareDrawer;
      });
    },
    setIsOpenContentDrawer: (isOpenContentDrawer: boolean) => {
      set((state) => {
        state.isOpenContentDrawer = isOpenContentDrawer;
      });
    },

    // event
    isOpenEventDialog: false,
    setIsOpenEventDialog: (isOpenEventDialog: boolean) => {
      set((state) => {
        state.isOpenEventDialog = isOpenEventDialog;
      });
    },

    // etc
    isConfirmAlertOpen: false,
    setIsConfirmAlertOpen(isGroupAlertOpen) {
      set((state) => {
        state.isConfirmAlertOpen = isGroupAlertOpen;
      });
    },

    isDefaultAlertOpen: false,
    setIsDefaultAlertOpen(isDefaultAlertOpen) {
      set((state) => {
        state.isDefaultAlertOpen = isDefaultAlertOpen;
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
