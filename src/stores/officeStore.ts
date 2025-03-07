import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Church, Group } from "@/data/mockOfficeData";

// 목데이터 추가
import { mockChurches } from "@/data/mockOfficeData";

// 예시 커뮤니티 목데이터
const mockUnions: Group[] = [
  {
    id: "union-1",
    name: "청년부",
    churchId: "church-1",
    churchName: "은혜교회",
    pastorName: "이청년 목사",
    memberCount: 45,
    description: "청년들을 위한 공동체입니다.",
    createdAt: "2023-04-15",
    groupType: "union",
  },
  {
    id: "union-2",
    name: "주일 찬양팀",
    churchId: "church-1",
    churchName: "은혜교회",
    pastorName: "김찬양 전도사",
    memberCount: 12,
    description: "주일 예배 찬양을 담당하는 팀입니다.",
    createdAt: "2023-05-20",
    groupType: "department",
  },
  {
    id: "union-3",
    name: "새가족부",
    churchId: "church-2",
    churchName: "사랑교회",
    pastorName: "박새가족 목사",
    memberCount: 8,
    description: "새가족을 환영하고 돌보는 부서입니다.",
    createdAt: "2023-02-10",
    groupType: "department",
  },
];

// 공동체 생성을 위한 데이터 타입
export interface UnionFormData {
  name: string;
  pastorName: string;
  description?: string;
  groupType?: "union" | "department";
}

interface OfficeState {
  // User's churches
  myChurches: Church[];
  // Selected church for viewing details
  selectedChurch: Church | null;
  // Groups belonging to the selected church
  churchGroups: Group[];
  // User's created unions
  myUnions: Group[];

  // Actions
  addChurch: (church: Church) => void;
  removeChurch: (churchId: string) => void;
  selectChurch: (church: Church) => void;
  loadChurchGroups: (churchId: string) => void;
  isChurchAdded: (churchId: string) => boolean;
  getChurchById: (churchId: string) => Church | null;

  // Union actions
  addUnion: (churchId: string, formData: UnionFormData) => void;
  removeUnion: (unionId: string) => void;
  getUnionById: (unionId: string) => Group | null;
  getUnionsByChurchId: (churchId: string) => Group[];
}

const useOfficeStore = create<OfficeState>()(
  devtools(
    (set, get) => ({
      myChurches: mockChurches.slice(0, 2), // 초기 상태에 목데이터 추가
      selectedChurch: null,
      churchGroups: [],
      myUnions: mockUnions, // 초기 상태에 목데이터 추가

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
      addUnion: (churchId, formData) => {
        // 새 워크스페이스 추가
        if (!churchId) return;

        const church = get().getChurchById(churchId);
        if (!church) return;

        const newUnion: Group = {
          id: `union-${Date.now()}`,
          name: formData.name,
          churchId: churchId,
          churchName: church.name,
          pastorName: formData.pastorName,
          description: formData.description || "",
          memberCount: 0,
          createdAt: new Date().toISOString(),
          groupType: formData.groupType || "union",
        };

        set((state) => ({
          myUnions: [...state.myUnions, newUnion],
        }));
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
