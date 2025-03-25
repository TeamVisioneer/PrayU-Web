export interface Church {
  id: string;
  name: string;
  address: string;
  pastor: string;
  memberCount: number;
  createdAt: string;
  imageUrl?: string;
  externalData?: {
    denomination?: string;
    phone?: string;
  };
}

export interface Group {
  id: string;
  name: string;
  churchId: string;
  churchName?: string;
  memberCount: number;
  description: string;
  createdAt: string;
  imageUrl?: string;
  pastorName?: string;
  groupType?: "union" | "department";
}

// Mock data for churches
export const mockChurches: Church[] = [
  {
    id: "church-1",
    name: "은혜교회",
    address: "서울시 강남구 테헤란로 123",
    pastor: "김목사",
    memberCount: 500,
    createdAt: "2023-01-15",
    imageUrl:
      "https://images.unsplash.com/photo-1438032005730-c779502df39b?q=80&w=2574&auto=format&fit=crop",
  },
  {
    id: "church-2",
    name: "사랑교회",
    address: "서울시 서초구 반포대로 45",
    pastor: "이목사",
    memberCount: 1200,
    createdAt: "2022-05-20",
    imageUrl:
      "https://images.unsplash.com/photo-1601331119205-7b2b7e5f3b3f?q=80&w=2574&auto=format&fit=crop",
  },
  {
    id: "church-3",
    name: "소망교회",
    address: "경기도 성남시 분당구 정자동 123-45",
    pastor: "박목사",
    memberCount: 800,
    createdAt: "2022-08-10",
    imageUrl:
      "https://images.unsplash.com/photo-1548625361-58a9b86aa83b?q=80&w=2574&auto=format&fit=crop",
  },
  {
    id: "church-4",
    name: "믿음교회",
    address: "서울시 송파구 올림픽로 300",
    pastor: "최목사",
    memberCount: 350,
    createdAt: "2023-03-05",
    imageUrl:
      "https://images.unsplash.com/photo-1514896856000-91cb6de818e0?q=80&w=2574&auto=format&fit=crop",
  },
  {
    id: "church-5",
    name: "기쁨교회",
    address: "경기도 용인시 수지구 풍덕천동 123",
    pastor: "정목사",
    memberCount: 420,
    createdAt: "2022-11-15",
    imageUrl:
      "https://images.unsplash.com/photo-1543465077-db45d34b88a5?q=80&w=2574&auto=format&fit=crop",
  },
];

// Mock data for groups
export const mockGroups: Group[] = [
  {
    id: "group-1",
    name: "청년부",
    churchId: "church-1",
    churchName: "은혜교회",
    memberCount: 50,
    description: "20-30대 청년들의 모임",
    createdAt: "2023-02-10",
    imageUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2574&auto=format&fit=crop",
    pastorName: "김목사",
    groupType: "union",
  },
  {
    id: "group-2",
    name: "대학부",
    churchId: "church-1",
    churchName: "은혜교회",
    memberCount: 35,
    description: "대학생들의 모임",
    createdAt: "2023-02-15",
    imageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2574&auto=format&fit=crop",
    pastorName: "김목사",
    groupType: "department",
  },
  {
    id: "group-3",
    name: "중고등부",
    churchId: "church-1",
    churchName: "은혜교회",
    memberCount: 25,
    description: "중고등학생들의 모임",
    createdAt: "2023-03-01",
    imageUrl:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2574&auto=format&fit=crop",
    pastorName: "김목사",
    groupType: "department",
  },
  {
    id: "group-4",
    name: "장년부",
    churchId: "church-2",
    churchName: "사랑교회",
    memberCount: 120,
    description: "40-60대 장년들의 모임",
    createdAt: "2022-06-10",
    imageUrl:
      "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2574&auto=format&fit=crop",
    pastorName: "이목사",
    groupType: "union",
  },
  {
    id: "group-5",
    name: "청년부",
    churchId: "church-2",
    churchName: "사랑교회",
    memberCount: 85,
    description: "20-30대 청년들의 모임",
    createdAt: "2022-06-15",
    imageUrl:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2574&auto=format&fit=crop",
    pastorName: "이목사",
    groupType: "department",
  },
  {
    id: "group-6",
    name: "대학부",
    churchId: "church-3",
    churchName: "소망교회",
    memberCount: 60,
    description: "대학생들의 모임",
    createdAt: "2022-09-05",
    imageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2574&auto=format&fit=crop",
    pastorName: "박목사",
    groupType: "department",
  },
  {
    id: "group-7",
    name: "청년부",
    churchId: "church-3",
    churchName: "소망교회",
    memberCount: 45,
    description: "20-30대 청년들의 모임",
    createdAt: "2022-09-10",
    imageUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2574&auto=format&fit=crop",
    pastorName: "박목사",
    groupType: "union",
  },
];

// Function to get groups by church ID
export const getGroupsByChurchId = (churchId: string): Group[] => {
  return mockGroups.filter((group) => group.churchId === churchId);
};

// Function to search churches by name
export const searchChurches = (query: string): Church[] => {
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  return mockChurches.filter((church) =>
    church.name.toLowerCase().includes(lowerQuery) ||
    church.address.toLowerCase().includes(lowerQuery)
  );
};
