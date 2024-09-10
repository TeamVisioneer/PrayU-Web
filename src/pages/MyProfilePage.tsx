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

const MyProfilePage = () => {
  const { user } = useAuth();
  const signOut = useBaseStore((state) => state.signOut);

  const setAlertData = useBaseStore((state) => state.setAlertData);
  const setIsConfirmAlertOpen = useBaseStore(
    (state) => state.setIsConfirmAlertOpen
  );

  const getProfile = useBaseStore((state) => state.getProfile);
  const profile = useBaseStore((state) => state.profile);

  const [name, setName] = useState("");

  const updateProfile = useBaseStore((state) => state.updateProfile);

  const onBlurUpdateName = () => {
    if (name.trim() === "") setName(profile?.full_name || "");
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

  useEffect(() => {
    getProfile(user!.id);
  }, [user, getProfile]);

  useEffect(() => {
    if (profile) setName(profile.full_name!);
  }, [profile]);

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
        {profile ? (
          <img
            className="h-full object-cover rounded-full"
            src={profile.avatar_url || "/images/defaultProfileImage.png"}
          />
        ) : (
          <Skeleton className="h-[80px] w-[80px] rounded-full bg-gray-300" />
        )}
      </div>
      {profile ? (
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
                    <span className="p-2">
                      {profile.blocking_users.length} 명
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="w-full py-2">
                    sdfdddddddddddsdfddddddddddd
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
                  <div className="w-full flex flex-col py-2 gap-2">
                    <p
                      className="text-sm text-gray-400 underline"
                      onClick={() => onClickExitPrayU()}
                    >
                      회원 탈퇴
                    </p>
                    <p
                      className="text-sm text-gray-400 underline"
                      onClick={() => onClickExitPrayU()}
                    >
                      회원 탈퇴
                    </p>
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
        </div>
      )}
    </div>
  );
};

export default MyProfilePage;
