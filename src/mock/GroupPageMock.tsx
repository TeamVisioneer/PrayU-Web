import React, { useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import ShareDrawer from "@/components/share/ShareDrawer";
import MyMember from "@/components/member/MyMember";
import OtherMemberList from "@/components/member/OtherMemberList";
import TodayPrayCardListDrawer from "@/components/todayPray/TodayPrayCardListDrawer";
import GroupSettingsDialog from "@/components/group/GroupSettingsDialog";
import PrayListDrawer from "@/components/pray/PrayListDrawer";
import OtherMemberDrawer from "@/components/member/OtherMemberDrawer";
import BannerDialog from "@/components/notice/BannerDialog";
import GroupHeader from "@/components/group/GroupHeader";
import MyMemberDrawer from "@/components/member/MyMemberDrawer";
import TodayPrayBtn from "@/components/todayPray/TodayPrayBtn";
import { PrayType } from "@/Enums/prayType";
import {
  mockGroup,
  mockMembers,
  mockPrayCardsWithPrays,
  mockCurrentUser,
  mockMyMember,
  mockOtherMembers,
  mockUserPrayCardList,
} from "./mockData";
import { createMockApiFunctions } from "./mockApiFunctions";

const GroupPageMock: React.FC = () => {
  // 필요한 store 상태들
  const setTargetGroup = useBaseStore((state) => state.setTargetGroup);
  const setPrayCardCarouselList = useBaseStore(
    (state) => state.setPrayCardCarouselList
  );
  const setHasPrayCardCurrentWeek = useBaseStore(
    (state) => state.setHasPrayCardCurrentWeek
  );
  const setIsGroupLeader = useBaseStore((state) => state.setIsGroupLeader);
  const user = useBaseStore((state) => state.user);

  // 즉시 user 상태 설정 (렌더링 전에 설정)
  if (!user || user.id !== mockCurrentUser.id) {
    // 목업 API 함수들을 baseStore에 적용
    const mockFunctions = createMockApiFunctions();

    useBaseStore.setState({
      user: {
        id: mockCurrentUser.id,
        email: "kim@example.com",
        aud: "authenticated",
        role: "authenticated",
        email_confirmed_at: new Date().toISOString(),
        phone: undefined,
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {
          full_name: mockCurrentUser.full_name,
          name: mockCurrentUser.full_name,
          email: "kim@example.com",
        },
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_anonymous: false,
      },
      userLoading: false,
      // 목업 API 함수들로 baseStore 함수들 오버라이드
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(mockFunctions as any),
    });
  }

  useEffect(() => {
    // 목업 데이터로 store 상태 설정

    // 프로필 정보 설정
    useBaseStore.setState({
      myProfile: mockCurrentUser,
    });

    // 타겟 그룹 설정
    setTargetGroup({
      ...mockGroup,
      profiles: mockCurrentUser,
    });

    // 멤버 관련 상태 설정 (OtherMemberList Skeleton 방지)
    useBaseStore.setState({
      memberList: mockMembers,
      memberListView: mockOtherMembers,
      memberCount: mockMembers.length,
      memberLoading: false,
    });

    // 내 멤버 정보 설정 (MyMember Skeleton 방지)
    useBaseStore.setState({
      myMember: mockMyMember,
    });

    // 사용자 기도카드 목록 설정 (MyMember Skeleton 방지)
    useBaseStore.setState({
      userPrayCardList: mockUserPrayCardList,
    });

    // 기도카드 관련 상태 설정
    useBaseStore.setState({
      inputPrayCardContent: mockUserPrayCardList[0]?.content || "",
      inputPrayCardLife: mockUserPrayCardList[0]?.life || "",
    });

    // 기도카드 목록 설정 (오늘의 기도 버튼용)
    setPrayCardCarouselList(mockPrayCardsWithPrays);

    // 현재 주 기도카드가 있음을 표시
    setHasPrayCardCurrentWeek(true);

    // 그룹장으로 설정 (김기도가 그룹장)
    setIsGroupLeader(true);

    // 타겟 기도카드를 첫 번째 기도카드로 설정 (PrayListDrawer용)
    useBaseStore.setState({
      targetPrayCard: mockPrayCardsWithPrays[0],
    });

    // 오늘의 기도 완료 상태 설정 - 처음에는 미완료로 설정하여 기도 반응을 할 수 있도록 함
    useBaseStore.setState({
      isPrayToday: true, // 처음에는 오늘 기도하지 않은 상태
      isPrayTodayForMember: true, // 다른 멤버들 기도도 안한 상태
    });

    // todayPrayTypeHash 설정 (반응 표시용) - 처음에는 비어있는 상태로 시작
    const todayPrayTypeHash: Record<string, PrayType | null> = {};
    mockPrayCardsWithPrays.forEach((card) => {
      todayPrayTypeHash[card.id] = null; // 처음에는 아무 반응도 안한 상태
    });
    useBaseStore.setState({
      todayPrayTypeHash,
    });

    // 알림 관련 상태 설정 (NotificationBtn에서 사용)
    useBaseStore.setState({
      userNotificationUnreadTotal: 3, // 알림 3개 있는 것으로 설정
    });

    // 기타 상태 초기화
    useBaseStore.setState({
      targetGroupLoading: false,
    });
  }, [
    setTargetGroup,
    setPrayCardCarouselList,
    setHasPrayCardCurrentWeek,
    setIsGroupLeader,
  ]);

  // user가 설정되지 않았으면 로딩 표시
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <GroupHeader />
      <div className="flex flex-col px-5 pb-5 flex-grow gap-4">
        <div className="flex flex-col gap-2">
          <MyMember myMember={mockMyMember} />
        </div>
        <OtherMemberList />
      </div>
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2">
        <TodayPrayBtn
          groupId={mockGroup.id}
          eventOption={{ where: "GroupPageMock" }}
        />
      </div>

      <TodayPrayCardListDrawer />
      <MyMemberDrawer />
      <OtherMemberDrawer />
      <PrayListDrawer />
      <ShareDrawer />
      <BannerDialog />
      <GroupSettingsDialog />
    </div>
  );
};

export default GroupPageMock;
