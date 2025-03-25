import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Church, Group } from "@/data/mockOfficeData";
import { groupUnionController } from "@/apis/office/groupUnionController";
import { GroupUnion } from "../../supabase/types/tables";

// 목데이터 추가
import { mockChurches } from "@/data/mockOfficeData";

// 공동체 생성을 위한 데이터 타입
export interface UnionFormData {
  name: string;
  church: string;
  intro: string;
}

// Supabase GroupUnion 타입을 애플리케이션 Group 타입으로 변환하는 함수
const mapGroupUnionToGroup = (union: GroupUnion): Group => {
  return {
    id: union.id,
    name: union.name,
    churchId: "temp-id", // DB 구조에 따라 조정 필요
    churchName: union.church,
    description: union.intro,
    memberCount: 0, // 기본값 설정
    createdAt: union.created_at,
    groupType: "union",
  };
};

interface OfficeState {
  // User's churches
  myChurches: Church[];
  // Selected church for viewing details
  selectedChurch: Church | null;
  // Groups belonging to the selected church
  churchGroups: Group[];
  // User's created unions
  myUnions: Group[];
  // Loading states
  isLoadingUnions: boolean;

  // Actions
  fetchMyUnions: (userId: string) => Promise<void>;
  addChurch: (church: Church) => void;
  removeChurch: (churchId: string) => void;
  selectChurch: (church: Church) => void;
  loadChurchGroups: (churchId: string) => void;
  isChurchAdded: (churchId: string) => boolean;
  getChurchById: (churchId: string) => Church | null;

  // Union actions
  createUnion: (formData: UnionFormData) => Promise<Group | null>;
  removeUnion: (unionId: string) => void;
  getUnionById: (unionId: string) => Group | null;
  getUnionsByChurchId: (churchId: string) => Group[];
}

const useOfficeStore = create<OfficeState>()(
  devtools(
    (set, get) => ({
      myChurches: mockChurches.slice(0, 2), // 초기 상태에 목데이터 추가 (추후 API로 대체 가능)
      selectedChurch: null,
      churchGroups: [],
      myUnions: [],
      isLoadingUnions: false,

      // 사용자의 공동체 목록을 가져오는 함수
      fetchMyUnions: async (userId: string) => {
        set({ isLoadingUnions: true });

        try {
          if (!userId) {
            set({ isLoadingUnions: false });
            return;
          }

          const unions = await groupUnionController.fetchGroupUnionListByUserId(
            userId,
          );

          if (unions) {
            // GroupUnion을 Group 타입으로 변환
            const transformedUnions = unions.map(mapGroupUnionToGroup);
            set({ myUnions: transformedUnions });
          }
        } catch (error) {
          console.error("Failed to fetch unions:", error);
        } finally {
          set({ isLoadingUnions: false });
        }
      },

      addChurch: (church) => {
        // 이미 추가된 교회인지 확인
        if (get().isChurchAdded(church.id)) {
          return;
        }
        set((state) => ({
          myChurches: [...state.myChurches, church],
        }));
      },

      removeChurch: (churchId) => {
        set((state) => ({
          myChurches: state.myChurches.filter((church) =>
            church.id !== churchId
          ),
          // 선택된 교회가 삭제되면 선택 해제
          selectedChurch: state.selectedChurch?.id === churchId
            ? null
            : state.selectedChurch,
          // 삭제된 교회에 속한 공동체도 모두 삭제
          myUnions: state.myUnions.filter(
            (union) => union.churchId !== churchId,
          ),
        }));
      },

      selectChurch: (church) => {
        set({ selectedChurch: church });
        if (church) {
          // 교회 선택 시 해당 교회의 그룹 로드
          get().loadChurchGroups(church.id);
        }
      },

      loadChurchGroups: (churchId) => {
        // API 대신 목데이터에서 관련 그룹 필터링
        const groups = get().myUnions.filter(
          (union) => union.churchId === churchId,
        );
        set({ churchGroups: groups });
      },

      isChurchAdded: (churchId) => {
        return get().myChurches.some((church) => church.id === churchId);
      },

      getChurchById: (churchId) => {
        const { myChurches } = get();
        return myChurches.find((church) => church.id === churchId) || null;
      },

      // Union actions
      createUnion: async (formData) => {
        try {
          const newGroupUnion = await groupUnionController.createGroupUnion({
            church: formData.church,
            name: formData.name,
            intro: formData.intro,
          });

          if (newGroupUnion) {
            const newGroup = mapGroupUnionToGroup(newGroupUnion);

            set((state) => ({
              myUnions: [...state.myUnions, newGroup],
            }));

            return newGroup;
          }
          return null;
        } catch (error) {
          console.error("Failed to create union:", error);
          return null;
        }
      },

      removeUnion: (unionId) => {
        set((state) => ({
          myUnions: state.myUnions.filter(
            (union) => union.id !== unionId,
          ),
        }));
      },

      getUnionById: (unionId) => {
        const state = get();
        return state.myUnions.find(
          (union) => union.id === unionId,
        ) || null;
      },

      getUnionsByChurchId: (churchId) => {
        const state = get();
        return state.myUnions.filter(
          (union) => union.churchId === churchId,
        );
      },
    }),
    { name: "office-store" },
  ),
);

export default useOfficeStore;
