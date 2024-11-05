import useAuth from "@/hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import SettingDialog from "@/components/profile/SettingDialog";
import { useEffect } from "react";
import { IoChevronBack } from "react-icons/io5";
import { Skeleton } from "@/components/ui/skeleton";
import { IoSettingsOutline } from "react-icons/io5";
import PrayCardHistoryList from "@/components/profile/PrayCardHistoryList";
import PrayCardHistoryDrawer from "@/components/profile/PrayCardHistoryDrawer";
import PrayCardHistoryPrayListDrawer from "@/components/profile/PrayCardHistoryPrayListDrawer";
import { analyticsTrack } from "@/analytics/analytics";
import PrayCalendar from "@/components/profile/PrayCalendar";

const MyProfilePage = () => {
  const { user } = useAuth();
  const myProfile = useBaseStore((state) => state.myProfile);
  const profileList = useBaseStore((state) => state.profileList);
  const getProfile = useBaseStore((state) => state.getProfile);
  const fetchProfileList = useBaseStore((state) => state.fetchProfileList);
  const setIsOpenSettingDialog = useBaseStore(
    (state) => state.setIsOpenSettingDialog
  );
  const fetchUserPrayCardListAll = useBaseStore(
    (state) => state.fetchUserPrayCardList
  );

  useEffect(() => {
    getProfile(user!.id);
    fetchUserPrayCardListAll(user!.id);
  }, [user, getProfile, fetchUserPrayCardListAll]);

  useEffect(() => {
    if (myProfile) fetchProfileList(myProfile.blocking_users);
  }, [myProfile, fetchProfileList]);

  if (!myProfile || !profileList) {
    return (
      <div className="w-full flex flex-grow flex-col gap-4 items-center">
        <div className="w-full flex justify-between items-center">
          <div className="w-[60px]">
            <IoChevronBack size={20} onClick={() => window.history.back()} />
          </div>
          <span className="text-lg font-bold">나의 정보</span>
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
    <div className="w-full flex flex-col gap-1 items-center">
      <div className="w-full flex flex-col gap-3 bg-mainBg z-10">
        <div className="w-full flex justify-between items-center">
          <div className="w-14 ">
            <IoChevronBack size={20} onClick={() => window.history.back()} />
          </div>
          <span className="text-lg font-semibold">나의 정보</span>
          <div
            className="flex justify-end items-center w-14"
            onClick={onClickSettingBtn}
          >
            <IoSettingsOutline size={20} color="#222222" />
          </div>
        </div>
        <div className="flex flex-col justify-center gap-4">
          <div className="flex justify-center h-[70px] object-cover">
            <img
              className="h-full aspect-square rounded-full object-cover"
              src={myProfile.avatar_url || "/images/defaultProfileImage.png"}
            />
          </div>
          <PrayCalendar />
          <div className="w-full flex flex-col items-start text-sm font-semibold pt-1 pl-3">
            지난 기도카드
          </div>
        </div>
      </div>
      <PrayCardHistoryList />

      <footer className="fixed bottom-0 z-10 bg-mainBg w-full px-6 py-3 flex justify-between text-gray-400 text-[10px]">
        <span>© 2024 PrayU. All rights reserved.</span>
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
