import useBaseStore from "@/stores/baseStore";
import SettingDialog from "@/components/profile/SettingDialog";
import { useEffect } from "react";
import { IoChevronBack } from "react-icons/io5";
import { Skeleton } from "@/components/ui/skeleton";
import { IoSettingsOutline } from "react-icons/io5";
import PrayCardHistoryList from "@/components/profile/PrayCardHistoryList";
import PrayCardHistoryDrawer from "@/components/profile/PrayCardHistoryDrawer";
import { analyticsTrack } from "@/analytics/analytics";
import PrayCalendar from "@/components/profile/PrayCalendar";
import { getISOTodayDate, getNextDate, getWeekInfo } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import PrayListDrawer from "@/components/pray/PrayListDrawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MyProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const myProfile = useBaseStore((state) => state.myProfile);
  const historyPrayCardCount = useBaseStore(
    (state) => state.historyPrayCardCount
  );
  const userTotalPrayCount = useBaseStore((state) => state.userTotalPrayCount);
  const profileList = useBaseStore((state) => state.profileList);
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
  const prayListByDate = useBaseStore((state) => state.prayListByDate);
  const fetchPrayListByDate = useBaseStore(
    (state) => state.fetchPrayListByDate
  );
  const fetchUserTotalPrayCount = useBaseStore(
    (state) => state.fetchUserTotalPrayCount
  );

  const setHistoryPrayCardListView = useBaseStore(
    (state) => state.setHistoryPrayCardListView
  );
  const currentDate = getISOTodayDate();
  const weekInfo = getWeekInfo(currentDate);
  const startDt = weekInfo.weekDates[0];
  const endDt = getNextDate(weekInfo.weekDates[6]);

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
    fetchHistoryPrayCardList();
  }, [
    user,
    getProfile,
    fetchUserPrayCardList,
    fetchUserPrayCardCount,
    fetchUserTotalPrayCount,
    setHistoryPrayCardListView,
  ]);

  useEffect(() => {
    if (myProfile) fetchProfileList(myProfile.blocking_users);
    if (myProfile) fetchPrayListByDate(myProfile.id, startDt, endDt);
  }, [myProfile, fetchProfileList, fetchPrayListByDate, startDt, endDt]);

  if (
    !myProfile ||
    !profileList ||
    !prayListByDate ||
    historyPrayCardCount === null
  ) {
    return (
      <div className="w-full min-h-screen bg-mainBg flex flex-col">
        <header className="sticky top-0 z-50 bg-mainBg border-b border-gray-100 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between p-5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="p-1 hover:bg-white/50 rounded-lg transition-colors"
              >
                <IoChevronBack size={20} className="text-gray-700" />
              </button>
              <h1 className="text-xl font-bold text-gray-800">내 프로필</h1>
            </div>
            <div className="p-1">
              <IoSettingsOutline size={20} className="text-gray-700" />
            </div>
          </div>
        </header>

        <main className="flex-grow p-4 space-y-6 animate-pulse">
          <section className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-5">
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
    <div className="w-full min-h-screen bg-mainBg flex flex-col">
      <header className="sticky top-0 z-50 bg-mainBg border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between p-5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="p-1 hover:bg-white/50 rounded-lg transition-colors"
            >
              <IoChevronBack size={20} className="text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">내 프로필</h1>
          </div>
          <button
            onClick={onClickSettingBtn}
            className="p-1 hover:bg-white/50 rounded-lg transition-colors"
          >
            <IoSettingsOutline size={20} className="text-gray-700" />
          </button>
        </div>
      </header>

      <main className="flex-grow p-4 space-y-6">
        <section className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-5">
          <img
            className="h-20 w-20 rounded-full object-cover ring-4 ring-white"
            src={myProfile.avatar_url || "/images/defaultProfileImage.png"}
            alt="Profile Avatar"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {myProfile.full_name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              지금까지 총 {userTotalPrayCount}번의 기도를 받았어요!
            </p>
          </div>
        </section>

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid h-12 w-full grid-cols-2 rounded-xl border border-gray-100 bg-white p-1 shadow-sm">
            <TabsTrigger
              value="history"
              className="flex-1 h-full rounded-lg text-gray-500 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-mainBtn data-[state=active]:to-blue-600 data-[state=active]:font-semibold data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              기도카드 보관함
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="flex-1 h-full rounded-lg text-gray-500 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-mainBtn data-[state=active]:to-blue-600 data-[state=active]:font-semibold data-[state=active]:text-white data-[state=active]:shadow-md"
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

      <footer className="w-full bg-mainBg px-6 py-4 text-center text-xs text-gray-500">
        <div className="mb-2">© 2025 PrayU. All rights reserved.</div>
        <div className="flex gap-2 justify-center">
          <a
            href="https://plip.kr/pcc/e117f200-873e-4090-8234-08d0116f9d03/privacy/1.html"
            className="hover:underline"
          >
            개인정보 처리방침
          </a>
          <span>|</span>
          <a href="/term/240909" className="hover:underline">
            이용약관
          </a>
        </div>
      </footer>

      <SettingDialog />
      <PrayCardHistoryDrawer />
      <PrayListDrawer />
    </div>
  );
};

export default MyProfilePage;
