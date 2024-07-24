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
  userIdPrayCardListHash,
  TodayPrayTypeHash,
  PrayDataHash,
  PrayWithProfiles,
} from "../../supabase/types/tables";
import { fetchGroupListByUserId, getGroup, createGroup } from "@/apis/group";
import { fetchMemberListByGroupId, createMember } from "@/apis/member";
import {
  createPrayCard,
  fetchPrayCardListByGroupId,
  fetchPrayCardListByUserId,
  updatePrayCardContent,
} from "@/apis/prayCard";
import { PrayType } from "@/Enums/prayType";
import { getISOToday } from "@/lib/utils";
import { type CarouselApi } from "@/components/ui/carousel";

interface EmojiData {
  emoji: string;
  text: string;
  num: number;
}

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
  openTodayPrayDrawer: boolean;
  setOpenTodayPrayDrawer: (openTodayPrayDrawer: boolean) => void;

  // member
  memberList: MemberWithProfiles[] | null;
  targetMember: Member | null;
  userIdMemberHash: UserIdMemberHash | null;
  fetchMemberListByGroupId: (groupId: string | undefined) => Promise<void>;
  createMember: (
    groupId: string | undefined,
    userId: string | undefined
  ) => Promise<Member | null>;
  makePrayerShort: (text: string | null, length: number) => string;

  // prayCard
  groupPrayCardList: PrayCardWithProfiles[] | null;
  userPrayCardList: PrayCardWithProfiles[] | null;
  userIdPrayCardListHash: userIdPrayCardListHash | null;
  targetPrayCard: PrayCardWithProfiles | null;
  inputPrayCardContent: string;
  isEditingPrayCard: boolean;
  myPrayerContent: string | null;
  setMyPrayerContent: (myPrayerContent: string) => void;
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
  prayCardCarouselApi: CarouselApi | null;
  setPrayCardCarouselApi: (prayCardCarouselApi: CarouselApi) => void;
  setIsEditingPrayCard: (isEditingPrayCard: boolean) => void;
  handleEditClick: () => void;
  handleSaveClick: (prayCardId: string, myPrayerContent: string) => void;

  // pray
  prayData: Pray[] | null;
  prayDataHash: PrayDataHash;
  todayPrayTypeHash: TodayPrayTypeHash;
  isPrayToday: boolean;
  reactionDatas: { [key in PrayType]?: EmojiData };
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
    openTodayPrayDrawer: false,
    setOpenTodayPrayDrawer: (openTodayPrayDrawer: boolean) => {
      set((state) => {
        state.openTodayPrayDrawer = openTodayPrayDrawer;
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
    makePrayerShort: (text: string | null, length: number = 10): string => {
      if (text && text.length <= length) {
        return text;
      }
      return text
        ? text.substring(0, length) + "..."
        : "아직 기도제목이 없어요";
    },

    // prayCard
    groupPrayCardList: null,
    userPrayCardList: null,
    userIdPrayCardListHash: null,
    targetPrayCard: null,
    inputPrayCardContent: "",
    isEditingPrayCard: false,
    myPrayerContent: null,
    setMyPrayerContent: (myPrayerContent: string) => {
      set((state) => {
        state.myPrayerContent = myPrayerContent;
      });
    },
    setIsEditingPrayCard: (isEditingPrayCard: boolean) => {
      set((state) => {
        state.isEditingPrayCard = isEditingPrayCard;
      });
    },
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
    prayCardCarouselApi: null,
    setPrayCardCarouselApi: (prayCardCarouselApi: CarouselApi) => {
      set((state) => {
        state.prayCardCarouselApi = prayCardCarouselApi;
      });
    },
    handleEditClick: () => {
      set((state) => {
        state.isEditingPrayCard = true;
      });
    },
    handleSaveClick: (prayCardId, myPrayerContent) => {
      updatePrayCardContent(prayCardId, myPrayerContent);
      set((state) => {
        state.isEditingPrayCard = false;
        state.myPrayerContent = myPrayerContent;
      });
    },

    // pray
    prayData: null,
    prayDataHash: {},
    todayPrayTypeHash: {},
    isPrayToday: false,
    reactionDatas: {
      [PrayType.PRAY]: { emoji: "🙏", text: "기도해요", num: 0 },
      [PrayType.GOOD]: { emoji: "👍", text: "힘내세요", num: 0 },
      [PrayType.LIKE]: { emoji: "❤️", text: "응원해요", num: 0 },
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
            state.reactionDatas[type]!.num = prayData.filter(
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
  }))
);

export default useBaseStore;
