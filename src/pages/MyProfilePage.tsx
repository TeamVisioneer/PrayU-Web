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
import PrayCardHistoryPrayListDrawer from "@/components/profile/PrayCardHistoryPrayListDrawer";

const MyProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const myProfile = useBaseStore((state) => state.myProfile);
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
    fetchHistoryPrayCardList();
  }, [
    user,
    getProfile,
    fetchUserPrayCardList,
    fetchUserPrayCardCount,
    setHistoryPrayCardListView,
  ]);

  useEffect(() => {
    if (myProfile) fetchProfileList(myProfile.blocking_users);
    if (myProfile) fetchPrayListByDate(myProfile.id, startDt, endDt);
  }, [myProfile, fetchProfileList, fetchPrayListByDate, startDt, endDt]);

  if (!myProfile || !profileList || !prayListByDate) {
    return (
      <div className="p-5 w-full flex flex-grow flex-col gap-4 items-center">
        <div className="w-full flex justify-between items-center">
          <div className="w-[60px]">
            <IoChevronBack size={20} onClick={() => navigate(-1)} />
          </div>
          <span className="text-lg font-bold">내 프로필</span>
          <div className="w-[60px] flex justify-end items-center"></div>
        </div>
        <div className="flex justify-center h-[80px] object-cover">
          <Skeleton className="h-[80px] w-[80px] rounded-full bg-gray-300" />
        </div>
        <div className="w-full flex flex-col gap-4">
          <Skeleton className="w-full h-[55px] flex items-center gap-4 p-4 bg-gray-300 rounded-xl" />
          <Skeleton className="w-full h-[55px] flex items-center gap-4 p-4 bg-gray-300 rounded-xl" />
          <Skeleton className="w-full h-[55px] flex items-center gap-4 p-4 bg-gray-300 rounded-xl" />
          <Skeleton className="w-full h-[55px] flex items-center gap-4 p-4 bg-gray-300 rounded-xl" />
        </div>
      </div>
    );
  }
  const onClickSettingBtn = () => {
    setIsOpenSettingDialog(true);
    analyticsTrack("클릭_내프로필_설정", {});
  };

  return (
    <div className="p-5 w-full flex flex-col gap-1 items-center">
      <div className="w-full flex flex-col gap-3 bg-mainBg z-10">
        <div className="w-full flex justify-between items-center">
          <div className="w-14 ">
            <IoChevronBack size={20} onClick={() => window.history.back()} />
          </div>
          <span className="text-lg font-bold">내 프로필</span>
          <div
            className="flex justify-end items-center w-14"
            onClick={onClickSettingBtn}
          >
            <IoSettingsOutline size={20} color="#222222" />
          </div>
        </div>
        <div className="flex flex-col justify-center gap-4">
          <div className="flex flex-col items-center">
            <div className="flex justify-center h-[70px] object-cover">
              <img
                className="h-full aspect-square rounded-full object-cover"
                src={myProfile.avatar_url || "/images/defaultProfileImage.png"}
              />
            </div>
            <p className="text-sm font-semibold pt-2">{myProfile.full_name}</p>
          </div>
          <PrayCalendar />
          <div className="w-full flex flex-col items-start text-sm font-semibold pt-1 pl-3">
            지난 기도카드
          </div>
        </div>
      </div>
      <PrayCardHistoryList />

      <footer className="fixed max-w-[480px] bottom-0 z-10 bg-mainBg w-full px-6 py-3 flex justify-between text-gray-400 text-[10px]">
        <span>© 2025 PrayU. All rights reserved.</span>
        <div className="flex gap-2">
          <a href="https://plip.kr/pcc/e117f200-873e-4090-8234-08d0116f9d03/privacy/1.html">
            개인정보 처리방침
          </a>
          <span>|</span>
          <a href="https://mmyeong.notion.site/PrayU-ee61275fa48842cda5a5f2ed5b608ec0?pvs=4">
            이용약관
          </a>
        </div>
      </footer>
      <SettingDialog />
      <PrayCardHistoryDrawer />
      <PrayCardHistoryPrayListDrawer />
    </div>
  );
};

export default MyProfilePage;
