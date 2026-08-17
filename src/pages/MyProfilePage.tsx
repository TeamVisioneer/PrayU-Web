import useBaseStore from "@/stores/baseStore";
import PageHeader from "@/components/common/PageHeader";
import SettingDialog from "@/components/profile/SettingDialog";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { IoSettingsOutline } from "react-icons/io5";
import PrayCardHistoryList from "@/components/profile/PrayCardHistoryList";
import PrayCardHistoryDrawer from "@/components/profile/PrayCardHistoryDrawer";
import { analyticsTrack } from "@/analytics/analytics";
import PrayCalendar from "@/components/profile/PrayCalendar";
import useAuth from "@/hooks/useAuth";
import PrayListDrawer from "@/components/pray/PrayListDrawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserPlanType } from "@/Enums/userPlanType";
import { Crown } from "lucide-react";

const MyProfilePage = () => {
  const { user } = useAuth();
  const myProfile = useBaseStore((state) => state.myProfile);
  const historyPrayCardCount = useBaseStore(
    (state) => state.historyPrayCardCount
  );
  const userTotalPrayCount = useBaseStore((state) => state.userTotalPrayCount);
  const getProfile = useBaseStore((state) => state.getProfile);
  const fetchProfileList = useBaseStore((state) => state.fetchProfileList);
  const setIsOpenSettingDialog = useBaseStore(
    (state) => state.setIsOpenSettingDialog
  );
  const fetchUserPrayCardList = useBaseStore(
    (state) => state.fetchUserPrayCardList
  );
  const fetchUserPrayCardCount = useBaseStore(
    (state) => state.fetchUserPrayCardCount
  );
  const fetchUserTotalPrayCount = useBaseStore(
    (state) => state.fetchUserTotalPrayCount
  );
  const myMemberList = useBaseStore((state) => state.myMemberList);
  const fetchMemberListByUserId = useBaseStore(
    (state) => state.fetchMemberListByUserId
  );
  const userPlan = useBaseStore((state) => state.userPlan);

  const setHistoryPrayCardListView = useBaseStore(
    (state) => state.setHistoryPrayCardListView
  );
  useEffect(() => {
    const fetchHistoryPrayCardList = async () => {
      const newHistoryPrayCardList = await fetchUserPrayCardList(
        user!.id,
        18,
        0
      );
      if (!newHistoryPrayCardList) return;
      setHistoryPrayCardListView([...newHistoryPrayCardList]);
    };

    getProfile(user!.id);
    fetchUserPrayCardCount(user!.id);
    fetchUserTotalPrayCount(user!.id);
    fetchMemberListByUserId(user!.id);
    fetchHistoryPrayCardList();
  }, [
    user,
    getProfile,
    fetchUserPrayCardList,
    fetchUserPrayCardCount,
    fetchUserTotalPrayCount,
    fetchMemberListByUserId,
    setHistoryPrayCardListView,
  ]);

  // 달력 데이터는 PrayCalendar 가 월 범위로 직접 조회한다 (plans/my-profile-refresh.md PR 2)
  useEffect(() => {
    if (myProfile) fetchProfileList(myProfile.blocking_users);
  }, [myProfile, fetchProfileList]);

  // 게이트는 첫 페인트에 필요한 것만 — 차단 목록(설정 다이얼로그)·달력 데이터는 각 소비처에서 대기한다
  if (!myProfile || historyPrayCardCount === null) {
    return (
      <div className="w-full h-full bg-mainBg flex flex-col">
        <PageHeader
          title="내 프로필"
          right={<IoSettingsOutline size={20} className="text-gray-400" />}
        />

        <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6 animate-pulse">
          <section className="border border-glassBorder/50 bg-surfaceCard/70 shadow-member p-6 rounded-2xl flex items-center gap-5">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-4 w-40 rounded-md" />
            </div>
          </section>

          <div className="w-full">
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }
  const onClickSettingBtn = () => {
    setIsOpenSettingDialog(true);
    analyticsTrack("클릭_내프로필_설정", {});
  };

  return (
    // 내부 스크롤 컨테이너가 이 페이지의 스크롤을 소유한다 — AppLayout(h-100vh) 아래에서
    // min-h-screen 을 쓰면 넘친 콘텐츠가 잘린 채 스크롤이 불가능했다 (2026-08-17 달력 상세에서 발견)
    <div className="w-full h-full bg-mainBg flex flex-col">
      <PageHeader
        title="내 프로필"
        right={
          <button
            onClick={onClickSettingBtn}
            className="rounded-lg p-1 transition-colors hover:bg-white/60"
          >
            <IoSettingsOutline size={20} className="text-liteBlack" />
          </button>
        }
      />

      <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
        <section className="rounded-2xl border border-glassBorder/50 bg-surfaceCard/70 p-6 shadow-member">
          <div className="flex items-center gap-5">
            <img
              className="h-20 w-20 rounded-full object-cover ring-4 ring-white"
              src={myProfile.avatar_url || "/images/defaultProfileImage.png"}
              alt="Profile Avatar"
            />
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-black">
                {myProfile.full_name}
              </h2>
              {userPlan == UserPlanType.Premium && (
                <Badge
                  variant="outline"
                  className="gap-1.5 border-0 bg-gradient-to-r from-accentFrom to-accentTo text-white shadow-md ring-1 ring-accentFrom/40 px-3 py-1 rounded-full whitespace-nowrap"
                >
                  <Crown size={12} className="text-white opacity-90" />
                  {UserPlanType.Premium}
                </Badge>
              )}
            </div>
          </div>
          {/* 기록 스탯 — 이 화면의 존재 이유(기록의 축적)를 숫자로. 아이콘 타일 없이 텍스트 위계로 */}
          <div className="mt-5 grid grid-cols-3 divide-x divide-glassBorder/60">
            {[
              { label: "기도카드", value: historyPrayCardCount },
              { label: "받은 기도", value: userTotalPrayCount },
              {
                label: "그룹",
                value:
                  myMemberList === null
                    ? null
                    : myMemberList.filter((member) => member.group_id !== null)
                        .length,
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-lg font-bold text-black">
                  {value === null ? "–" : value.toLocaleString()}
                </span>
                <span className="text-xs text-dark">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <Tabs defaultValue="history" className="w-full">
          {/* 라인 탭(표준 활성 문법): 옅은 기준선 + 활성 탭 아래 강조색 언더라인 (2026-08-17 확정) */}
          <TabsList className="grid h-11 w-full grid-cols-2 rounded-none border-b border-gray-200 bg-transparent p-0">
            <TabsTrigger
              value="history"
              className="-mb-px h-full flex-1 rounded-none border-b-2 border-transparent text-base text-dark transition-colors duration-200 data-[state=active]:border-accentTo data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-accentTo data-[state=active]:shadow-none"
            >
              기도카드 보관함
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="-mb-px h-full flex-1 rounded-none border-b-2 border-transparent text-base text-dark transition-colors duration-200 data-[state=active]:border-accentTo data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-accentTo data-[state=active]:shadow-none"
            >
              기도 달력
            </TabsTrigger>
          </TabsList>
          <TabsContent value="history" className="mt-4">
            <PrayCardHistoryList />
          </TabsContent>
          <TabsContent value="calendar" className="mt-4">
            <PrayCalendar />
          </TabsContent>
        </Tabs>
      </main>

      <SettingDialog />
      <PrayCardHistoryDrawer />
      <PrayListDrawer />
    </div>
  );
};

export default MyProfilePage;
