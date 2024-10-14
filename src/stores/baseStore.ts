import {
  createPray,
  fetchTodayUserPrayByGroupId,
  fetchTotalPrayCount,
  updatePray,
} from "./../apis/pray";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { supabase } from "../../supabase/client";
import { User, Session } from "@supabase/supabase-js";
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
  GroupWithProfiles,
} from "../../supabase/types/tables";
import {
  fetchGroupListByUserId,
  getGroup,
  createGroup,
  updateGroupParams,
  updateGroup,
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
import { analyticsIdentify, analyticsTrack } from "@/analytics/analytics";
import {
  fetchProfileList,
  updateProfile,
  updateProfilesParams,
} from "@/apis/profiles";
import { getProfile } from "@/apis/profiles";
import { updateUserMetaData } from "@/apis/user";

export interface BaseStore {
  // user
  session: Session | null;
  user: User | null;
  userLoading: boolean;
  userPlan: string;
  getUser: () => void;
  updateUserMetaData: (params: { [key: string]: string }) => Promise<void>;
  signOut: () => Promise<void>;
  setUserPlan: (userId: string) => void;

  // profiles
  myProfile: Profiles | null;
  profileList: Profiles[] | null;
  getProfile: (userId: string) => Promise<Profiles | null>;
  fetchProfileList: (userIds: string[]) => Promise<Profiles[] | null>;
  updateProfile: (
    userId: string,
    params: updateProfilesParams
  ) => Promise<Profiles | null>;

  // group
  groupList: Group[] | null;
  targetGroup: GroupWithProfiles | null;
  inputGroupName: string;
  isDisabledGroupCreateBtn: boolean;
  isGroupLeader: boolean;
  targetGroupLoading: boolean;
  fetchGroupListByUserId: (userId: string) => Promise<void>;
  getGroup: (groupId: string) => Promise<void>;
  setGroupName: (groupName: string) => void;
  setIsDisabledGroupCreateBtn: (isDisabled: boolean) => void;
  setIsGroupLeader: (isGroupLeader: boolean) => void;
  createGroup: (
    userId: string,
    name: string,
    intro: string
  ) => Promise<GroupWithProfiles | null>;
  updateGroup: (
    groupId: string,
    params: updateGroupParams
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
  inputPrayCardContent: string;
  isEditingPrayCard: boolean;
  isDisabledPrayCardCreateBtn: boolean;
  isDisabledSkipPrayCardBtn: boolean;
  prayCardCarouselApi: CarouselApi | null;
  prayCardCarouselList: PrayCardWithProfiles[] | null;
  prayCardCarouselIndex: number;
  setPrayCardCarouselIndex: (index: number) => void;
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
  setPrayCardCarouselList: (
    prayCardCarouselList: PrayCardWithProfiles[] | null
  ) => void;
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
  setIsDisabledSkipPrayCardBtn: (isDisabledSkipPrayCardBtn: boolean) => void;
  updatePrayCardContent: (prayCardId: string, content: string) => Promise<void>;
  setPrayCardContent: (content: string) => void;
  setPrayCardCarouselApi: (prayCardCarouselApi: CarouselApi) => void;
  deletePrayCard: (prayCardId: string) => Promise<void>;
  deletePrayCardByGroupId: (userId: string, groupId: string) => Promise<void>;

  // pray
  todayPrayTypeHash: TodayPrayTypeHash;
  isPrayToday: boolean | null;
  isPrayTodayForMember: boolean | null;
  totalPrayCount: number;
  setIsPrayToday: (isPrayToday: boolean) => void;
  setIsPrayTodayForMember: (isPrayTodayForMember: boolean) => void;
  fetchTodayUserPrayByGroupId: (
    userId: string,
    groupId: string
  ) => Promise<void>;
  fetchTotalPrayCount: () => Promise<void>;
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

  bannerDialogContentType: "invite" | "reward" | null;
  isOpenBannerDialog: boolean;
  setIsOpenBannerDialog: (isOpenBannerDialog: boolean) => void;
  setBannerDialogContent: (
    bannerDialogContentType: "invite" | "reward"
  ) => void;

  // etc
  isConfirmAlertOpen: boolean;
  setIsConfirmAlertOpen: (isGroupAlertOpen: boolean) => void;

  isDefaultAlertOpen: boolean;
  setIsDefaultAlertOpen: (isDefaultAlertOpen: boolean) => void;

  isReportAlertOpen: boolean;
  setIsReportAlertOpen: (isReportAlertOpen: boolean) => void;

  reportData: {
    currentUserId: string;
    targetUserId: string;
    content: string;
  };
  setReportData: (reportData: {
    currentUserId: string;
    targetUserId: string;
    content: string;
  }) => void;

  alertData: {
    color: string;
    title: string;
    description: string;
    cancelText: string;
    actionText: string;
    onAction: () => void;
  };
  setAlertData: (alertData: {
    color: string;
    title: string;
    description: string;
    cancelText: string;
    actionText: string;
    onAction: () => void;
  }) => void;

  // drawer
  isOpenOnboardingDrawer: boolean;
  setIsOpenOnboardingDrawer: (isOpenOnboardingDrawer: boolean) => void;

  isOpenLoginDrawer: boolean;
  setIsOpenLoginDrawer: (isOpenLoginDrawer: boolean) => void;

  //dialog
  isOpenGroupSettingsDialog: boolean;
  setIsOpenGroupSettingsDialog: (isOpenGroupSettingsDialog: boolean) => void;
}

const useBaseStore = create<BaseStore>()(
  immer((set) => ({
    // user
    session: null,
    user: null,
    userLoading: true,
    userPlan: "",
    getUser: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      set((state) => {
        state.session = session;
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
        const { email, full_name, name } = session.user.user_metadata;

        if (ENV === "staging" || ENV === "prod") {
          Sentry.setUser({
            WEB_VERSION: WEB_VERSION,
            id: userId,
            email: email,
            name: name,
          });
          analyticsIdentify(session.user.id, {
            WEB_VERSION: WEB_VERSION,
            email: email,
            full_name: full_name,
            name: name,
          });
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    },
    updateUserMetaData: async (params: { [key: string]: string }) => {
      await updateUserMetaData(params);
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

    // profiles
    myProfile: null,
    profileList: null,
    getProfile: async (userId: string) => {
      const data = await getProfile(userId);
      set((state) => {
        state.myProfile = data;
      });
      return data;
    },
    fetchProfileList: async (userIds: string[]) => {
      const data = await fetchProfileList(userIds);
      set((state) => {
        state.profileList = data;
      });
      return data;
    },
    updateProfile: async (
      userId: string,
      params: updateProfilesParams
    ): Promise<Profiles | null> => {
      const myProfile = await updateProfile(userId, params);
      return myProfile;
    },

    // group
    groupList: null,
    targetGroup: null,
    inputGroupName: "",
    isDisabledGroupCreateBtn: false,
    isGroupLeader: false,
    fetchGroupListByUserId: async (userId: string) => {
      const data = await fetchGroupListByUserId(userId);
      set((state) => {
        state.groupList = data;
      });
    },
    targetGroupLoading: true,
    getGroup: async (groupId: string) => {
      const data = await getGroup(groupId);
      set((state) => {
        state.targetGroup = data;
        state.targetGroupLoading = false;
      });
    },
    createGroup: async (
      userId: string,
      name: string,
      intro: string
    ): Promise<GroupWithProfiles | null> => {
      const group = await createGroup(userId, name, intro);
      set((state) => {
        state.targetGroup = group;
      });
      return group;
    },
    updateGroup: async (groupId: string, params: updateGroupParams) => {
      const group = await updateGroup(groupId, params);
      return group;
    },
    setGroupName: (groupName: string) => {
      set((state) => {
        state.inputGroupName = groupName;
        state.isDisabledGroupCreateBtn = groupName.trim() === "";
      });
    },
    setIsGroupLeader: (isGroupLeader: boolean) => {
      set((state) => {
        state.isGroupLeader = isGroupLeader;
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
    inputPrayCardContent: "",
    isEditingPrayCard: false,
    isDisabledPrayCardCreateBtn: false,
    isDisabledSkipPrayCardBtn: false,
    prayCardCarouselApi: null,
    prayCardCarouselList: null,
    prayCardCarouselIndex: 0,
    setPrayCardCarouselIndex: (index: number) => {
      set((state) => {
        state.prayCardCarouselIndex = index;
      });
    },
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
        state.groupPrayCardList = [];
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
    setPrayCardCarouselList: (
      prayCardCarouselList: PrayCardWithProfiles[] | null
    ) => {
      set((state) => {
        state.prayCardCarouselList = prayCardCarouselList;
      });
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
    setIsDisabledSkipPrayCardBtn: (isDisabled: boolean) => {
      set((state) => {
        state.isDisabledSkipPrayCardBtn = isDisabled;
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
    isPrayTodayForMember: null,
    totalPrayCount: 0,
    fetchTotalPrayCount: async () => {
      const totalPrayCount = await fetchTotalPrayCount();
      set((state) => {
        state.totalPrayCount = totalPrayCount;
      });
    },
    setIsPrayToday: (isPrayToday: boolean) => {
      set((state) => {
        state.isPrayToday = isPrayToday;
      });
    },
    setIsPrayTodayForMember: (isPrayTodayForMember: boolean) => {
      set((state) => {
        state.isPrayTodayForMember = isPrayTodayForMember;
      });
    },
    fetchTodayUserPrayByGroupId: async (userId: string, groupId: string) => {
      const userPrayList = await fetchTodayUserPrayByGroupId(userId, groupId);
      set((state) => {
        state.isPrayToday = Boolean(userPrayList.length);
        state.isPrayTodayForMember = userPrayList.some(
          (pray) => pray.pray_card.user_id !== userId
        );
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
      analyticsTrack("드로어_초대", { isOpen: isOpenShareDrawer });
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

    bannerDialogContentType: null,
    isOpenBannerDialog: false,
    setIsOpenBannerDialog: (isOpenBannerDialog: boolean) => {
      set((state) => {
        state.isOpenBannerDialog = isOpenBannerDialog;
      });
    },
    setBannerDialogContent: (bannerDialogContentType: "invite" | "reward") => {
      set((state) => {
        state.bannerDialogContentType = bannerDialogContentType;
      });
    },

    //drawer
    isOpenOnboardingDrawer: false,
    setIsOpenOnboardingDrawer: (isOpenOnboardingDrawer: boolean) => {
      set((state) => {
        state.isOpenOnboardingDrawer = isOpenOnboardingDrawer;
      });
    },

    isOpenLoginDrawer: false,
    setIsOpenLoginDrawer: (isOpenLoginDrawer: boolean) => {
      set((state) => {
        state.isOpenLoginDrawer = isOpenLoginDrawer;
      });
    },

    // etc
    isConfirmAlertOpen: false,
    setIsConfirmAlertOpen(isOpen) {
      set((state) => {
        state.isConfirmAlertOpen = isOpen;
      });
    },

    isReportAlertOpen: false,
    reportData: {
      currentUserId: "",
      targetUserId: "",
      content: "",
    },
    setReportData: (reportData) => {
      set((state) => {
        state.reportData = reportData;
      });
    },
    setIsReportAlertOpen(isOpen) {
      set((state) => {
        state.isReportAlertOpen = isOpen;
      });
    },

    isDefaultAlertOpen: false,
    setIsDefaultAlertOpen(isOpen) {
      set((state) => {
        state.isDefaultAlertOpen = isOpen;
      });
    },

    alertData: {
      color: "",
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

    //dialog
    isOpenGroupSettingsDialog: false,
    setIsOpenGroupSettingsDialog: (isOpenGroupSettingsDialog: boolean) => {
      set((state) => {
        state.isOpenGroupSettingsDialog = isOpenGroupSettingsDialog;
      });
    },
  }))
);

export default useBaseStore;
