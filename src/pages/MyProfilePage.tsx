import { Input } from "@/components/ui/input";
import useAuth from "@/hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import { useEffect, useState } from "react";
import { IoChevronBack } from "react-icons/io5";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteUser } from "../apis/user.ts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Profiles } from "supabase/types/tables.ts";
import { UserProfile } from "@/components/profile/UserProfile.tsx";

const MyProfilePage = () => {
  const { user } = useAuth();
  const signOut = useBaseStore((state) => state.signOut);

  const setAlertData = useBaseStore((state) => state.setAlertData);
  const setIsConfirmAlertOpen = useBaseStore(
    (state) => state.setIsConfirmAlertOpen
  );

  const myProfile = useBaseStore((state) => state.myProfile);
  const profileList = useBaseStore((state) => state.profileList);
  const getProfile = useBaseStore((state) => state.getProfile);
  const fetchProfileList = useBaseStore((state) => state.fetchProfileList);

  const [name, setName] = useState("");

  const updateProfile = useBaseStore((state) => state.updateProfile);

  const onBlurUpdateName = () => {
    if (name.trim() === "") setName(myProfile?.full_name || "");
    else updateProfile(user!.id, { full_name: name });
  };

  const onClickExitPrayU = () => {
    setAlertData({
      title: "PrayU 탈퇴하기",
      description: `더 이상 기도 나눔을 할 수 없게 돼요 :(`,
      actionText: "탈퇴하기",
      cancelText: "취소",
      onAction: async () => {
        const userId = user!.id;
        await signOut();
        await deleteUser(userId);
        window.location.href = "/";
      },
    });
    setIsConfirmAlertOpen(true);
  };

  const onClickUnblock = async (
    myProfile: Profiles,
    blockedProfileId: string
  ) => {
    const updatedBlockingUsers = myProfile.blocking_users.filter(
      (id) => id !== blockedProfileId
    );
    await updateProfile(myProfile.id, { blocking_users: updatedBlockingUsers });
    fetchProfileList(updatedBlockingUsers);
  };

  useEffect(() => {
    getProfile(user!.id);
  }, [user, getProfile]);

  useEffect(() => {
    if (myProfile) setName(myProfile.full_name!);
    if (myProfile) fetchProfileList(myProfile.blocking_users);
  }, [myProfile, fetchProfileList]);

  return (
    <div className="w-ful flex flex-col gap-6 items-center">
      <div className="w-full flex justify-between items-center">
        <div className="w-[28px]">
          <IoChevronBack size={20} onClick={() => window.history.back()} />
        </div>

        <span className="text-xl font-bold">나의 정보</span>
        <p className="w-[28px]"></p>
      </div>
      <div className="flex justify-center h-[80px] w-max">
        {myProfile && profileList ? (
          <img
            className="h-full object-cover rounded-full"
            src={myProfile.avatar_url || "/images/defaultProfileImage.png"}
          />
        ) : (
          <Skeleton className="h-[80px] w-[80px] rounded-full bg-gray-300" />
        )}
      </div>
      {myProfile && profileList ? (
        <div className="w-full flex flex-col items-center gap-4 ">
          <div className="w-full h-14 flex items-center px-4 py-2 bg-white rounded-xl">
            <span className="text-md font-semibold">이름</span>
            <Input
              className="flex-1 p-0 text-md border-none text-right"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => onBlurUpdateName()}
              placeholder="이름을 입력해주세요!"
              maxLength={12}
            />
          </div>

          <div className="w-full flex px-4 py-2 justify-between items-center bg-white rounded-xl text-md ">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className="w-full h-10 flex flex-grow justify-between items-center">
                    <span className="font-semibold">차단친구 관리</span>
                    <span className="p-2">{profileList.length} 명</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="w-full flex flex-col gap-4 py-4">
                    {profileList.map((blockedProfile) => (
                      <div
                        key={blockedProfile.id}
                        className="w-full flex justify-between items-center bg-white rounded-xl"
                      >
                        <UserProfile profile={blockedProfile} />
                        <Badge
                          variant="outline"
                          onClick={() =>
                            onClickUnblock(myProfile, blockedProfile.id)
                          }
                        >
                          차단 해제
                        </Badge>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="w-full flex px-4 py-2 justify-between items-center bg-white rounded-xl text-md ">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className="w-full h-10 flex flex-grow justify-between items-center">
                    <span className="font-semibold">계정 관리</span>
                    <span className="text-sm p-2">
                      {user!.user_metadata.email}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="w-full flex flex-col p-2 gap-2 text-sm text-gray-400 underline text-end">
                    <p onClick={() => onClickExitPrayU()}>회원탈퇴</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-2">
          <Skeleton className="w-full h-[55px] flex items-center gap-4 p-4 bg-gray-300 rounded-xl" />
          <Skeleton className="w-full h-[55px] flex items-center gap-4 p-4 bg-gray-300 rounded-xl" />
          <Skeleton className="w-full h-[55px] flex items-center gap-4 p-4 bg-gray-300 rounded-xl" />
        </div>
      )}
    </div>
  );
};

export default MyProfilePage;
