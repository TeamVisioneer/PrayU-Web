import {
  createPray,
  fetchPrayByDateRange,
  fetchTodayUserPrayByGroupId,
  fetchTotalPrayCount,
  updatePray,
} from "./../apis/pray";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { supabase } from "../../supabase/client";
import { Session, User } from "@supabase/supabase-js";
import {
  Bible,
  Group,
  GroupWithProfiles,
  Member,
  MemberWithGroup,
  MemberWithProfiles,
  Notification,
  Pray,
  PrayCard,
  PrayCardWithProfiles,
  PrayWithProfiles,
  Profiles,
  QtData,
  TodayPrayTypeHash,
} from "../../supabase/types/tables";
import {
  createGroup,
  fetchGroupListByDate,
  fetchGroupListByGroupIds,
  fetchGroupListByUserId,
  getGroup,
  getGroupWithMemberList,
  updateGroup,
  updateGroupParams,
} from "@/apis/group";
import {
  bulkUpdateMembers,
  createMember,
  deleteMemberbyGroupId,
  fetchMemberCountByGroupId,
  fetchMemberListByGroupId,
  fetchMemberListByUserId,
  getMember,
  updateMember,
} from "@/apis/member";
import {
  createPrayCard,
  createPrayCardParams,
  createPrayCardWithParams,
  deletePrayCard,
  deletePrayCardByGroupId,
  fetchGroupPrayCardList,
  fetchOtherPrayCardListByGroupId,
  fetchUserPrayCardCount,
  fetchUserPrayCardList,
  fetchUserPrayCardListByGroupId,
  updatePrayCard,
  updatePrayCardParams,
} from "@/apis/prayCard";
import { PrayType } from "@/Enums/prayType";
import { getISOToday } from "@/lib/utils";
import { type CarouselApi } from "@/components/ui/carousel";
import * as Sentry from "@sentry/react";
import { analyticsIdentify } from "@/analytics/analytics";
import {
  fetchNewUserCount,
  fetchProfileCount,
  fetchProfileList,
  fetchProfileListByStartId,
  updateProfile,
  updateProfilesParams,
} from "@/apis/profiles";
import { getProfile } from "@/apis/profiles";
import { updateUserMetaData } from "@/apis/user";
import {
  checkAllNotification,
  createNotification,
  createNotificationParams,
  fetchNotificationCount,
  fetchUserNotificationList,
  updateNotification,
  updateNotificationParams,
} from "@/apis/notification";
import { fetchBibleList, getBible } from "@/apis/bible";
import { createQT, QTData } from "@/apis/openai";
import { createQtData, fetchQtData } from "@/apis/qt_data";
import {
  createOnesignalPush,
  CreateOnesignalPushParams,
  OnesignalPushResponse,
} from "@/apis/onesignal";

export interface BaseStore {
  // app
  isApp: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  setIsApp: (isApp: boolean) => void;
  setIsIOS: (isIOS: boolean) => void;
  setIsAndroid: (isAndroid: boolean) => void;

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
  profileCount: number;
  newUserCount: number;
  getProfile: (userId: string) => Promise<Profiles | null>;
  fetchProfileList: (userIds: string[]) => Promise<Profiles[] | null>;
  fetchProfileListByStartId: (
    startId: string,
    limit: number,
  ) => Promise<string[] | null>;
  fetchProfileCount: () => Promise<number>;
  fetchNewUserCount: (todayDate: string) => Promise<number>;
  updateProfile: (
    userId: string,
    params: updateProfilesParams,
  ) => Promise<Profiles | null>;
  isOpenSettingDialog: boolean;
  setIsOpenSettingDialog: (isOpenSettingDialog: boolean) => void;
  isOpenHistoryDrawer: boolean;
  setIsOpenHistoryDrawer: (isOpenHistoryDrawer: boolean) => void;

  // group
  groupList: GroupWithProfiles[] | null;
  todayGroupList: Group[] | null;
  targetGroup: GroupWithProfiles | null;
  fetchGroupListByGroupIds: (
    groupIds: string[],
  ) => Promise<GroupWithProfiles[] | null>;
  setTargetGroup: (targetGroup: GroupWithProfiles | null) => void;
  inputGroupName: string;
  isDisabledGroupCreateBtn: boolean;
  isGroupLeader: boolean;
  targetGroupLoading: boolean;
  fetchGroupListByUserId: (userId: string) => Promise<Group[] | null>;
  fetchGroupListByDate: (createdAt: string) => Promise<Group[] | null>;
  getGroup: (groupId: string) => Promise<void>;
  getGroupWithMemberList: (
    groupId: string,
  ) => Promise<GroupWithProfiles | null>;
  setGroupName: (groupName: string) => void;
  setIsDisabledGroupCreateBtn: (isDisabled: boolean) => void;
  setIsGroupLeader: (isGroupLeader: boolean) => void;
  createGroup: (
    userId: string,
    name: string,
    intro: string,
  ) => Promise<GroupWithProfiles | null>;
  updateGroup: (
    groupId: string,
    params: updateGroupParams,
  ) => Promise<Group | null>;
  isOpenTodayPrayDrawer: boolean;
  setIsOpenTodayPrayDrawer: (isOpenTodayPrayDrawer: boolean) => void;
  isOpenGroupMenuSheet: boolean;
  setIsOpenGroupMenuSheet: (isOpenGroupMenuSheet: boolean) => void;
  activeGroupMemberOption: string;
  setActiveGroupMemberOption: (activeGroupMemberOption: string) => void;
  isOpenGroupListDrawer: boolean;
  setIsOpenGroupListDrawer: (isOpenGroupListDrawer: boolean) => void;

  // member
  memberList: MemberWithProfiles[] | null;
  memberListView: MemberWithProfiles[];
  myMemberList: MemberWithGroup[] | null;
  memberCount: number | null;
  memberLoading: boolean;
  myMember: MemberWithProfiles | null;
  otherMember: MemberWithProfiles | null;
  isOpenOtherMemberDrawer: boolean;
  setIsOpenOtherMemberDrawer: (isOpenOtherMemberDrawer: boolean) => void;
  setMemberListView: (memberListView: MemberWithProfiles[]) => void;
  setMemberList: (memberList: MemberWithProfiles[] | null) => void;
  fetchMemberListByGroupId: (
    groupId: string,
    limit?: number,
    offset?: number,
  ) => Promise<MemberWithProfiles[] | null>;
  fetchMemberCountByGroupId: (groupId: string) => Promise<number | null>;
  fetchMemberListByUserId: (
    userId: string,
  ) => Promise<MemberWithGroup[] | null>;
  createMember: (
    groupId: string,
    userId: string,
    praySummary: string,
  ) => Promise<Member | null>;
  updateMember: (
    memberId: string,
    praySummary: string,
    updatedAt?: string,
  ) => Promise<Member | null>;
  bulkUpdateMembers: (
    memberIds: string[],
    praySummary: string,
    updatedAt?: boolean,
  ) => Promise<Member[] | null>;
  getMember: (
    userId: string,
    groupId: string,
  ) => Promise<MemberWithProfiles | null>;
  setOtherMember: (member: MemberWithProfiles | null) => void;
  isOpenMyMemberDrawer: boolean;
  setIsOpenMyMemberDrawer: (isOpenMyMemberDrawer: boolean) => void;
  deleteMemberbyGroupId: (userId: string, groupId: string) => Promise<void>;

  // prayCard
  groupPrayCardList: PrayCardWithProfiles[] | null;
  otherPrayCardList: PrayCardWithProfiles[] | null;
  userPrayCardList: PrayCardWithProfiles[] | null;
  hasPrayCardCurrentWeek: boolean;
  setHasPrayCardCurrentWeek: (hasPrayCardCurrentWeek: boolean) => void;
  historyPrayCardList: PrayCardWithProfiles[] | null;
  historyPrayCardListView: PrayCardWithProfiles[];
  setHistoryPrayCardListView: (
    historyPrayCardListView: PrayCardWithProfiles[],
  ) => void;
  setHistoryPrayCardList: (
    historyPrayCardList: PrayCardWithProfiles[] | null,
  ) => void;
  historyPrayCardCount: number | null;
  fetchUserPrayCardCount: (currentUserId: string) => Promise<number | null>;
  historyCard: PrayCardWithProfiles | null;
  targetPrayCard: PrayCardWithProfiles | null;
  setTargetPrayCard: (targetPrayCard: PrayCardWithProfiles | null) => void;
  setHistoryCard: (historyCard: PrayCardWithProfiles | null) => void;
  inputPrayCardContent: string;
  inputPrayCardLife: string;
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
    endDt: string,
  ) => Promise<PrayCardWithProfiles[] | null>;
  fetchOtherPrayCardListByGroupId: (
    currentUserId: string,
    userId: string,
    groupId: string,
  ) => Promise<PrayCardWithProfiles[] | null>;
  setPrayCardCarouselList: (
    prayCardCarouselList: PrayCardWithProfiles[] | null,
  ) => void;
  fetchUserPrayCardListByGroupId: (
    currentUserId: string,
    groupId: string,
  ) => Promise<PrayCardWithProfiles[] | null>;
  fetchUserPrayCardList: (
    currentUserId: string,
    limit?: number,
    offset?: number,
  ) => Promise<PrayCardWithProfiles[] | null>;
  createPrayCard: (
    groupId: string,
    userId: string,
    content: string,
  ) => Promise<PrayCard | null>;
  createPrayCardWithParams: (
    params: createPrayCardParams,
  ) => Promise<PrayCard | null>;
  setIsDisabledPrayCardCreateBtn: (
    isDisabledPrayCardCreateBtn: boolean,
  ) => void;
  setIsDisabledSkipPrayCardBtn: (isDisabledSkipPrayCardBtn: boolean) => void;
  updatePrayCard: (
    prayCardId: string,
    params: updatePrayCardParams,
  ) => Promise<void>;
  setPrayCardContent: (content: string) => void;
  setPrayCardLife: (content: string) => void;
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
    groupId: string,
  ) => Promise<void>;
  fetchTotalPrayCount: () => Promise<void>;
  createPray: (
    prayCardId: string,
    userId: string,
    prayType: PrayType,
  ) => Promise<Pray | null>;
  updatePray: (
    prayCardId: string | undefined,
    userId: string | undefined,
    prayType: PrayType,
  ) => Promise<Pray | null>;
  groupAndSortByUserId: (
    currentUserId: string,
    data: PrayWithProfiles[],
  ) => {
    [key: string]: PrayWithProfiles[];
  };
  prayListByDate: Pray[] | null;
  fetchPrayListByDate: (
    userId: string,
    startDt: string,
    endDt: string,
  ) => Promise<Pray[] | null>;

  //onesignal
  createOnesignalPush: (
    params: CreateOnesignalPushParams,
  ) => Promise<OnesignalPushResponse | null>;

  // notification
  userNotificationView: Notification[];
  userNotificationList: Notification[] | null;
  userNotificationTotal: number;
  userNotificationUnreadTotal: number;
  fetchUserNotificationList: (
    userId: string,
    unreadOnly?: boolean,
    limit?: number,
    offset?: number,
  ) => Promise<Notification[]>;
  fetchNotificationCount: (
    userId: string,
    unreadOnly?: boolean,
  ) => Promise<number>;
  checkAllNotification: (userId: string) => Promise<void>;
  createNotification: (
    params: createNotificationParams,
  ) => Promise<Notification | null>;
  updateNotification: (
    notificationId: string,
    params: updateNotificationParams,
  ) => Promise<Notification | null>;
  setUserNotificationView: (notificationView: Notification[]) => void;
  setUserNotificationUnreadTotal: (total: number) => void;

  // bible
  targetBible: Bible | null;
  targetBibleList: Bible[] | null;
  getBible: (
    longLabel: string,
    chapter: number,
    paragraph: number,
  ) => Promise<Bible | null>;
  fetchBibleList: (
    longLabel: string,
    chapter: number,
    startParagraph: number,
    endParagraph: number,
  ) => Promise<Bible[] | null>;

  // qt
  qtData: QTData | null;
  setQtData: (qtData: QTData | null) => void;
  createQtData(
    userId: string | null,
    longLabel: string,
    chapter: number,
    startParagraph: number,
    endParagraph: number,
    sentence: string,
  ): Promise<QtData | null>;
  fetchQtData: (
    longLabel: string,
    chapter: number,
    startParagraph: number,
    endParagraph: number,
  ) => Promise<QtData[] | null>;

  // myPray drawer
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

  isOpenWeekUpdateDialog: boolean;
  setIsOpenWeekUpdateDialog: (isOpenWeekUpdateDialog: boolean) => void;

  bannerDialogContentType: "invite" | "reward" | null;
  isOpenBannerDialog: boolean;
  setIsOpenBannerDialog: (isOpenBannerDialog: boolean) => void;
  setBannerDialogContent: (
    bannerDialogContentType: "invite" | "reward",
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
    cancelText?: string;
    actionText: string;
    onAction: () => void;
  };
  setAlertData: (alertData: {
    color: string;
    title: string;
    description: string;
    cancelText?: string;
    actionText: string;
    onAction: () => void;
  }) => void;

  // external link
  externalUrl: string | null;
  setExternalUrl: (url: string | null) => void;

  // drawer
  isOpenOnboardingDrawer: boolean;
  setIsOpenOnboardingDrawer: (isOpenOnboardingDrawer: boolean) => void;

  isOpenLoginDrawer: boolean;
  setIsOpenLoginDrawer: (isOpenLoginDrawer: boolean) => void;

  //dialog
  isOpenGroupSettingsDialog: boolean;
  setIsOpenGroupSettingsDialog: (isOpenGroupSettingsDialog: boolean) => void;
  isOpenHookingDialog: boolean;
  setIsOpenHookingDialog: (isOpenHookingDialog: boolean) => void;
}

const useBaseStore = create<BaseStore>()(
  immer((set) => ({
    // app
    isApp: false,
    isIOS: false,
    isAndroid: false,
    setIsApp: (isApp: boolean) =>
      set((state) => {
        state.isApp = isApp;
      }),
    setIsIOS: (isIOS: boolean) =>
      set((state) => {
        state.isIOS = isIOS;
      }),
    setIsAndroid: (isAndroid: boolean) =>
      set((state) => {
        state.isAndroid = isAndroid;
      }),

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
        ",",
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
    profileCount: 0,
    newUserCount: 0,
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
    fetchProfileListByStartId: async (startId: string, limit: number) => {
      const data = await fetchProfileListByStartId(startId, limit);
      return data;
    },
    fetchProfileCount: async () => {
      const data = await fetchProfileCount();
      set((state) => {
        state.profileCount = data;
      });
      return data;
    },
    fetchNewUserCount: async (todayDate: string) => {
      const data = await fetchNewUserCount(todayDate);
      set((state) => {
        state.newUserCount = data;
      });
      return data;
    },
    updateProfile: async (
      userId: string,
      params: updateProfilesParams,
    ): Promise<Profiles | null> => {
      const myProfile = await updateProfile(userId, params);
      return myProfile;
    },
    isOpenSettingDialog: false,
    setIsOpenSettingDialog: (isOpenSettingDialog: boolean) => {
      set((state) => {
        state.isOpenSettingDialog = isOpenSettingDialog;
      });
    },
    isOpenHistoryDrawer: false,
    setIsOpenHistoryDrawer: (isOpenHistoryDrawer: boolean) => {
      set((state) => {
        state.isOpenHistoryDrawer = isOpenHistoryDrawer;
      });
    },

    // group
    groupList: null,
    todayGroupList: null,
    targetGroup: null,
    targetGroupLoading: true,
    inputGroupName: "",
    isDisabledGroupCreateBtn: false,
    isGroupLeader: false,
    fetchGroupListByGroupIds: async (groupIds: string[]) => {
      const data = await fetchGroupListByGroupIds(groupIds);
      set((state) => {
        state.groupList = data;
      });
      return data;
    },
    fetchGroupListByUserId: async (userId: string) => {
      const data = await fetchGroupListByUserId(userId);
      set((state) => {
        state.groupList = data;
      });
      return data;
    },
    fetchGroupListByDate: async (createdAt: string) => {
      const data = await fetchGroupListByDate(createdAt);
      set((state) => {
        state.todayGroupList = data;
      });
      return data;
    },
    getGroup: async (groupId: string) => {
      const data = await getGroup(groupId);
      set((state) => {
        state.targetGroup = data;
        state.targetGroupLoading = false;
      });
    },
    getGroupWithMemberList: async (groupId: string) => {
      const data = await getGroupWithMemberList(groupId);
      return data;
    },
    createGroup: async (
      userId: string,
      name: string,
      intro: string,
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
    setTargetGroup: (targetGroup: GroupWithProfiles | null) => {
      set((state) => {
        state.targetGroup = targetGroup;
      });
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
    activeGroupMemberOption: "",
    setActiveGroupMemberOption: (activeGroupMemberOption: string) => {
      set((state) => {
        state.activeGroupMemberOption = activeGroupMemberOption;
      });
    },
    isOpenGroupListDrawer: false,
    setIsOpenGroupListDrawer: (isOpenGroupListDrawer: boolean) => {
      set((state) => {
        state.isOpenGroupListDrawer = isOpenGroupListDrawer;
      });
    },

    //member
    memberList: null,
    memberListView: [],
    myMemberList: null,
    memberCount: 0,
    memberLoading: true,
    myMember: null,
    otherMember: null,
    isOpenOtherMemberDrawer: false,
    setIsOpenOtherMemberDrawer: (isOpenOtherMemberDrawer: boolean) => {
      set((state) => {
        state.isOpenOtherMemberDrawer = isOpenOtherMemberDrawer;
      });
    },
    setMemberListView: (memberListView: MemberWithProfiles[]) => {
      set((state) => {
        state.memberListView = memberListView;
      });
    },
    setMemberList: (memberList: MemberWithProfiles[] | null) => {
      set((state) => {
        state.memberList = memberList;
      });
    },
    fetchMemberListByGroupId: async (
      groupId: string,
      limit?: number,
      offset?: number,
    ) => {
      const memberList = await fetchMemberListByGroupId(groupId, limit, offset);
      set((state) => {
        state.memberList = memberList;
      });
      return memberList;
    },
    fetchMemberCountByGroupId: async (groupId: string) => {
      const memberCount = await fetchMemberCountByGroupId(groupId);
      set((state) => {
        state.memberCount = memberCount;
      });
      return memberCount;
    },
    fetchMemberListByUserId: async (userId: string) => {
      const myMemberList = await fetchMemberListByUserId(userId);
      set((state) => {
        state.myMemberList = myMemberList;
      });
      return myMemberList;
    },
    createMember: async (
      groupId: string,
      userId: string,
      praySummay: string,
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
    bulkUpdateMembers: async (
      memberIds: string[],
      praySummary: string,
      updatedAt?: boolean,
    ) => {
      const members = await bulkUpdateMembers(
        memberIds,
        praySummary,
        updatedAt,
      );
      return members;
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
    hasPrayCardCurrentWeek: false,
    historyPrayCardList: null,
    historyPrayCardCount: 0,
    historyPrayCardListView: [],
    setHistoryPrayCardListView: (
      historyPrayCardListView: PrayCardWithProfiles[],
    ) => {
      set((state) => {
        state.historyPrayCardListView = historyPrayCardListView;
      });
    },
    setHasPrayCardCurrentWeek: (hasPrayCardCurrentWeek: boolean) => {
      set((state) => {
        state.hasPrayCardCurrentWeek = hasPrayCardCurrentWeek;
      });
    },

    otherPrayCardList: null,
    inputPrayCardContent: "",
    inputPrayCardLife: "",
    isDisabledPrayCardCreateBtn: false,
    isDisabledSkipPrayCardBtn: false,
    prayCardCarouselApi: null,
    prayCardCarouselList: null,
    prayCardCarouselIndex: 0,
    historyCard: null,
    targetPrayCard: null,
    setTargetPrayCard: (targetPrayCard: PrayCardWithProfiles | null) => {
      set((state) => {
        state.targetPrayCard = targetPrayCard;
      });
    },
    setPrayCardCarouselIndex: (index: number) => {
      set((state) => {
        state.prayCardCarouselIndex = index;
      });
    },
    fetchGroupPrayCardList: async (
      groupId: string,
      currentUserId: string,
      startDt: string,
      endDt: string,
    ) => {
      const groupPrayCardList = await fetchGroupPrayCardList(
        groupId,
        currentUserId,
        startDt,
        endDt,
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
                new Date(pray.created_at) <= endOfDay,
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
      prayCardCarouselList: PrayCardWithProfiles[] | null,
    ) => {
      set((state) => {
        state.prayCardCarouselList = prayCardCarouselList;
      });
    },
    fetchOtherPrayCardListByGroupId: async (
      currentUserId: string,
      userId: string,
      groupId: string,
    ) => {
      set((state) => {
        state.otherPrayCardList = null;
      });
      const otherPrayCardList = await fetchOtherPrayCardListByGroupId(
        currentUserId,
        userId,
        groupId,
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
                new Date(pray.created_at) <= endOfDay,
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
      groupId: string,
    ) => {
      const userPrayCardList = await fetchUserPrayCardListByGroupId(
        currentUserId,
        groupId,
      );
      set((state) => {
        state.userPrayCardList = userPrayCardList;
      });
      return userPrayCardList;
    },
    fetchUserPrayCardList: async (
      currentUserId: string,
      limit?: number,
      offset?: number,
    ) => {
      const historyPrayCardList = await fetchUserPrayCardList(
        currentUserId,
        limit,
        offset,
      );
      set((state) => {
        state.historyPrayCardList = historyPrayCardList;
      });
      return historyPrayCardList;
    },
    createPrayCard: async (
      groupId: string,
      userId: string,
      content: string,
    ) => {
      const prayCard = await createPrayCard(groupId, userId, content);
      return prayCard;
    },
    createPrayCardWithParams: async (
      params: createPrayCardParams,
    ): Promise<PrayCard | null> => {
      const prayCard = await createPrayCardWithParams(params);
      return prayCard;
    },

    updatePrayCard: async (
      prayCardId: string,
      params: updatePrayCardParams,
    ) => {
      await updatePrayCard(prayCardId, params);
    },
    setPrayCardContent: (content: string) => {
      set((state) => {
        state.inputPrayCardContent = content;
      });
    },
    setPrayCardLife: (content: string) => {
      set((state) => {
        state.inputPrayCardLife = content;
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
    deletePrayCard: async (prayCardId: string) => {
      await deletePrayCard(prayCardId);
    },
    deletePrayCardByGroupId: async (userId: string, groupId: string) => {
      await deletePrayCardByGroupId(userId, groupId);
    },
    setHistoryPrayCardList: (
      historyPrayCardList: PrayCardWithProfiles[] | null,
    ) => {
      set((state) => {
        state.historyPrayCardList = historyPrayCardList;
      });
    },
    fetchUserPrayCardCount: async (currentUserId: string) => {
      const historyPrayCardCount = await fetchUserPrayCardCount(currentUserId);
      set((state) => {
        state.historyPrayCardCount = historyPrayCardCount;
      });
      return historyPrayCardCount;
    },
    setHistoryCard: (historyCard: PrayCardWithProfiles | null) => {
      set((state) => {
        state.historyCard = historyCard;
      });
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
          (pray) => pray.pray_card.user_id !== userId,
        );
      });
    },
    groupAndSortByUserId: (currentUserId: string, data: PrayWithProfiles[]) => {
      const hash: { [key: string]: PrayWithProfiles[] } = {};

      data.forEach((item) => {
        if (!hash[item.user_id!]) {
          hash[item.user_id!] = [];
        }
        hash[item.user_id!].push(item);
      });

      const sortedEntries = Object.entries(hash).sort(
        ([keyA, valueA], [keyB, valueB]) => {
          // 내 기도를 우선 정렬
          if (keyA === currentUserId) return -1;
          if (keyB === currentUserId) return 1;
          return valueB.length - valueA.length;
        },
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
      prayType: PrayType,
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
      prayType: PrayType,
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

    prayListByDate: null,
    fetchPrayListByDate: async (
      userId: string,
      startDt: string,
      endDt: string,
    ) => {
      const prayList = await fetchPrayByDateRange(userId, startDt, endDt);
      set((state) => {
        state.prayListByDate = prayList;
      });
      return prayList;
    },

    //onesignal
    createOnesignalPush: async (
      params: CreateOnesignalPushParams,
    ): Promise<OnesignalPushResponse | null> => {
      const response = await createOnesignalPush(params);
      return response;
    },

    // notification
    userNotificationList: null,
    userNotificationView: [],
    userNotificationTotal: 0,
    userNotificationUnreadTotal: 0,
    fetchUserNotificationList: async (
      userId: string,
      unreadOnly?: boolean,
      limit?: number,
      offset?: number,
    ) => {
      const notificationList = await fetchUserNotificationList(
        userId,
        unreadOnly,
        limit,
        offset,
      );
      set((state) => {
        state.userNotificationList = notificationList;
      });
      return notificationList;
    },
    fetchNotificationCount: async (
      userId: string,
      unreadOnly: boolean = false,
    ) => {
      const count = await fetchNotificationCount(userId, unreadOnly);
      set((state) => {
        if (unreadOnly) state.userNotificationUnreadTotal = count;
        else state.userNotificationTotal = count;
      });
      return count;
    },
    checkAllNotification: async (userId: string) => {
      await checkAllNotification(userId);
    },
    createNotification: async (params: createNotificationParams) => {
      const notification = await createNotification(params);
      return notification;
    },
    updateNotification: async (
      notificationId: string,
      params: updateNotificationParams,
    ) => {
      const notification = await updateNotification(notificationId, params);
      return notification;
    },
    setUserNotificationView: (notificationView: Notification[]) => {
      set((state) => {
        state.userNotificationView = notificationView;
      });
    },
    setUserNotificationUnreadTotal: (unread: number) => {
      set((state) => {
        state.userNotificationUnreadTotal = unread;
      });
    },

    // bible
    targetBible: null,
    targetBibleList: null,
    getBible: async (longLabel: string, chapter: number, paragraph: number) => {
      const bible = await getBible(longLabel, chapter, paragraph);
      set((state) => {
        state.targetBible = bible;
      });
      return bible;
    },
    fetchBibleList: async (
      longLabel: string,
      chapter: number,
      startParagraph: number,
      endParagraph: number,
    ) => {
      const bibleList = await fetchBibleList(
        longLabel,
        chapter,
        startParagraph,
        endParagraph,
      );
      set((state) => {
        state.targetBibleList = bibleList;
      });
      return bibleList;
    },

    // qt
    qtData: null,
    setQtData: (qtData: QTData | null) => {
      set((state) => {
        state.qtData = qtData;
      });
    },
    createQtData: async (
      userId: string,
      longLabel: string,
      chapter: number,
      startParagraph: number,
      endParagraph: number,
      sentence: string,
    ) => {
      const content =
        `${longLabel} ${chapter}:${startParagraph}~${endParagraph}`;
      const qtGenerated = await createQT(content);
      const result = JSON.stringify(qtGenerated);
      const qtData = await createQtData(
        userId,
        longLabel,
        chapter,
        startParagraph,
        endParagraph,
        sentence,
        result,
      );
      return qtData;
    },
    fetchQtData: async (
      longLabel: string,
      chapter: number,
      startParagraph: number,
      endParagraph: number,
    ) => {
      const qtDataList = await fetchQtData(
        longLabel,
        chapter,
        startParagraph,
        endParagraph,
      );
      return qtDataList;
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

    isOpenWeekUpdateDialog: false,
    setIsOpenWeekUpdateDialog: (isOpenWeekUpdateDialog: boolean) => {
      set((state) => {
        state.isOpenWeekUpdateDialog = isOpenWeekUpdateDialog;
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

    // external link
    externalUrl: null,
    setExternalUrl: (url) => {
      set((state) => {
        state.externalUrl = url;
      });
    },

    // drawer
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

    //dialog
    isOpenGroupSettingsDialog: false,
    setIsOpenGroupSettingsDialog: (isOpenGroupSettingsDialog: boolean) => {
      set((state) => {
        state.isOpenGroupSettingsDialog = isOpenGroupSettingsDialog;
      });
    },
    isOpenHookingDialog: false,
    setIsOpenHookingDialog: (isOpenHookingDialog: boolean) => {
      set((state) => {
        state.isOpenHookingDialog = isOpenHookingDialog;
      });
    },
  })),
);

export default useBaseStore;
