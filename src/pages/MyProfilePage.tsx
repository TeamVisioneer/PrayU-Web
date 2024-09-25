import { useRef } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LuInfo, LuPencil, LuSave } from "react-icons/lu";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Profiles } from "supabase/types/tables.ts";
import { UserProfile } from "@/components/profile/UserProfile.tsx";
import { analyticsTrack } from "@/analytics/analytics.ts";

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
  const updateProfile = useBaseStore((state) => state.updateProfile);

  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onClickUpdateName = () => {
    setIsEditing(true);
    inputRef.current?.focus();
  };

  const onBlurUpdateName = () => {
    setIsEditing(false);
    if (name.trim() === "") setName(myProfile?.full_name || "");
    else updateProfile(user!.id, { full_name: name });
  };

  const onClickExitPrayU = () => {
    analyticsTrack("클릭_프로필_회원탈퇴", {});
    setAlertData({
      color: "bg-red-400",
      title: "PrayU 탈퇴하기",
      description: `더 이상 기도 나눔을 할 수 없게 돼요 :(`,
      actionText: "탈퇴하기",
      cancelText: "취소",
      onAction: async () => {
        const userId = user!.id;
        const success = await deleteUser(userId);
        if (success) {
          await signOut();
          window.location.href = "/";
        }
      },
    });
    setIsConfirmAlertOpen(true);
  };

  const onClickUnblock = async (
    myProfile: Profiles,
    blockedProfileId: string
  ) => {
    analyticsTrack("클릭_프로필_차단해제", {});
    const updatedBlockingUsers = myProfile.blocking_users.filter(
      (id) => id !== blockedProfileId
    );
    await updateProfile(myProfile.id, {
      blocking_users: updatedBlockingUsers,
    });
    fetchProfileList(updatedBlockingUsers);
  };

  const onChangeKakaoNotificationToggle = async () => {
    analyticsTrack("클릭_프로필_카카오메세지토글", {});
    if (!myProfile) return;
    await updateProfile(myProfile.id, {
      kakao_notification: !myProfile.kakao_notification,
    });
  };

  useEffect(() => {
    getProfile(user!.id);
  }, [user, getProfile]);

  useEffect(() => {
    if (myProfile) setName(myProfile.full_name!);
    if (myProfile) fetchProfileList(myProfile.blocking_users);
  }, [myProfile, fetchProfileList]);

  // TODO: 카카오 메세지 재기획 이후 진행
  const kakaoMessageEnabled = false;

  return (
    <div className="w-ful flex flex-col gap-6 items-center">
      <div className="w-full flex justify-between items-center">
        <div className="w-[60px]">
          <IoChevronBack size={20} onClick={() => window.history.back()} />
        </div>

        <span className="text-xl font-bold">나의 정보</span>
        <div className="w-[60px] flex justify-end items-center">
          {isEditing && <Badge>완료</Badge>}
        </div>
      </div>
      <div className="flex justify-center h-[80px] object-cover">
        {myProfile && profileList ? (
          <img
            className="h-full aspect-square rounded-full"
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
            <div className="flex flex-grow items-center gap-2">
              <Input
                ref={inputRef}
                className="p-0 text-md border-none text-right"
                type="text"
                value={name}
                onClick={() => onClickUpdateName()}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => onBlurUpdateName()}
                placeholder="이름을 입력해주세요!"
                maxLength={12}
              />
              {isEditing ? (
                <LuSave size={16} />
              ) : (
                <LuPencil size={16} onClick={() => onClickUpdateName()} />
              )}
            </div>
          </div>

          <div className="w-full flex px-4 py-2 justify-between items-center bg-white rounded-xl text-md ">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger
                  onClick={() => analyticsTrack("클릭_프로필_차단친구관리", {})}
                >
                  <div className="w-full h-10 flex flex-grow justify-between items-center">
                    <span className="font-semibold">차단친구 관리</span>
                    <span className="p-2">{profileList.length} 명</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="w-full flex flex-col gap-4 px-2 py-4">
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

          {kakaoMessageEnabled && (
            <div className="w-full flex px-4 py-2 justify-between items-center bg-white rounded-xl text-md ">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger
                    onClick={() => analyticsTrack("클릭_프로필_환경설정", {})}
                  >
                    <div className="w-full h-10 flex flex-grow justify-between items-center">
                      <span className="font-semibold">환경 설정</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="w-full flex flex-col p-2 gap-2 text-sm">
                      <div className="w-full flex justify-between items-center bg-white rounded-xl">
                        <div className="flex items-center gap-1">
                          <span>카카오 메세지 전송</span>
                          <Popover>
                            <PopoverTrigger
                              onClick={() =>
                                analyticsTrack(
                                  "클릭_프로필_카카오메세지설명",
                                  {}
                                )
                              }
                            >
                              <LuInfo size={16} color="gray" />
                            </PopoverTrigger>
                            <PopoverContent>
                              <span className="text-sm text-gray-500">
                                기도 반응 할 때 상대방에게 카카오 메세지가
                                전송됩니다
                              </span>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <Switch
                          defaultChecked={myProfile.kakao_notification}
                          onCheckedChange={() =>
                            onChangeKakaoNotificationToggle()
                          }
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          <div className="w-full flex px-4 py-2 justify-between items-center bg-white rounded-xl text-md ">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger
                  onClick={() => analyticsTrack("클릭_프로필_계정관리", {})}
                >
                  <div className="w-full h-10 flex flex-grow justify-between items-center">
                    <span className="font-semibold">계정 관리</span>
                    <span className="text-sm p-2 max-w-56 whitespace-nowrap overflow-hidden text-ellipsis">
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
    </div>
  );
};

export default MyProfilePage;
