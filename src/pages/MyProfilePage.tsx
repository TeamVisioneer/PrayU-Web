import useAuth from "@/hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import SettingDialog from "@/components/profile/SettingDialog";
import { useEffect } from "react";
import { IoChevronBack } from "react-icons/io5";
import { Skeleton } from "@/components/ui/skeleton";
import { IoSettingsOutline } from "react-icons/io5";
import HistoryList from "@/components/profile/HistoryList";

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
    (state) => state.fetchUserPrayCardListAll
  );

  useEffect(() => {
    getProfile(user!.id);
  }, [user, getProfile]);

  useEffect(() => {
    fetchUserPrayCardListAll(user!.id);
  }, [user, fetchUserPrayCardListAll]);

  useEffect(() => {
    if (myProfile) fetchProfileList(myProfile.blocking_users);
  }, [myProfile, fetchProfileList]);

  if (!myProfile || !profileList) {
    return (
      <div className="w-ful flex flex-col gap-6 items-center">
        <div className="w-full flex justify-between items-center">
          <div className="w-[60px]">
            <IoChevronBack size={20} onClick={() => window.history.back()} />
          </div>
          <span className="text-xl font-bold">내 프로필</span>
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
    //analyticsTrack("클릭_공지", {});
  };

  return (
    <div className="w-ful flex flex-col gap-6 items-center">
      <div className="w-full flex justify-between items-center">
        <div className="w-14 ">
          <IoChevronBack size={20} onClick={() => window.history.back()} />
        </div>
        <span className="text-xl font-bold">내 프로필</span>
        <div
          className="flex justify-end items-center w-14"
          onClick={onClickSettingBtn}
        >
          <IoSettingsOutline size={20} color="#222222" />
        </div>
      </div>
      <div className="flex justify-center h-[80px] object-cover">
        {myProfile && profileList ? (
          <img
            className="h-full aspect-square rounded-full object-cover"
            src={myProfile.avatar_url || "/images/defaultProfileImage.png"}
          />
        ) : (
          <Skeleton className="h-[80px] w-[80px] rounded-full bg-gray-300" />
        )}
      </div>
      <div className="w-full flex flex-col items-center">
        {myProfile.full_name} 님의 기도들
      </div>
      <div>
        <HistoryList />
      </div>

      <footer className="absolute bottom-4 w-full px-6 flex justify-between text-gray-400 text-[10px]">
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
    </div>
  );
};

export default MyProfilePage;
