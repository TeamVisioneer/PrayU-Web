import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { analyticsTrack } from "@/analytics/analytics.ts";
import useBaseStore from "@/stores/baseStore";
import { Input } from "@/components/ui/input";
import { KakaoTokenRepo } from "@/components/kakao/KakaoTokenRepo.ts";
import { deleteUser } from "../../apis/user.ts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/components/profile/UserProfile.tsx";
import InfoBtn from "@/components/alert/infoBtn.tsx";

const SettingDialog = () => {
  const isOpenSettingDialog = useBaseStore(
    (state) => state.isOpenSettingDialog
  );
  const setIsOpenSettingDialog = useBaseStore(
    (state) => state.setIsOpenSettingDialog
  );

  const { user } = useAuth();
  const setAlertData = useBaseStore((state) => state.setAlertData);
  const setIsConfirmAlertOpen = useBaseStore(
    (state) => state.setIsConfirmAlertOpen
  );

  const myProfile = useBaseStore((state) => state.myProfile);
  const profileList = useBaseStore((state) => state.profileList);
  const fetchProfileList = useBaseStore((state) => state.fetchProfileList);
  const updateProfile = useBaseStore((state) => state.updateProfile);
  const getProfile = useBaseStore((state) => state.getProfile);
  const signOut = useBaseStore((state) => state.signOut);

  const [name, setName] = useState("");

  useEffect(() => {
    if (myProfile) {
      setName(myProfile.full_name!);
    }
  }, [myProfile]);

  if (!myProfile || !profileList) return null;

  const onClickSignOut = () => {
    analyticsTrack("클릭_로그아웃", {});
    KakaoTokenRepo.cleanKakaoTokensInCookies();
    signOut();
  };

  const onBlurUpdateName = async () => {
    if (name.trim() === "") setName(myProfile?.full_name || "");
    else {
      await updateProfile(user!.id, { full_name: name });
      await getProfile(user!.id);
    }
  };

  const onClickExitPrayU = () => {
    analyticsTrack("클릭_프로필_회원탈퇴", {});
    setAlertData({
      color: "bg-red-400",
      title: "PrayU 탈퇴하기",
      description:
        "PrayU 계정을 탈퇴하시겠습니까?\nPrayU 의 모든 데이터가 삭제됩니다.",
      actionText: "탈퇴하기",
      cancelText: "취소",
      onAction: async () => {
        const userId = user!.id;
        const success = await deleteUser(userId);
        if (success) {
          signOut();
          localStorage.removeItem(
            `sb-${import.meta.env.VITE_SUPABASE_PROJECT_ID}-auth-token`
          );
          window.location.href = "/";
        }
      },
    });
    setIsConfirmAlertOpen(true);
  };

  const onClickUnblock = async (blockedProfileId: string) => {
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

  const onChangePushNotificationToggle = async () => {
    analyticsTrack("클릭_프로필_푸쉬알림토글", {});
    await updateProfile(myProfile.id, {
      push_notification: !myProfile.push_notification,
    });
  };

  const kakaoMessageEnabled = false;

  return (
    <Dialog open={isOpenSettingDialog} onOpenChange={setIsOpenSettingDialog}>
      <DialogContent className="w-11/12 h-[400px] overflow-auto rounded-2xl bg-mainBg">
        <DialogHeader>
          <DialogTitle className="text-xl text-left pb-4">설정</DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="w-full flex flex-col gap-6 items-center">
            <div className="w-full flex flex-col items-center gap-4">
              <div className="w-full h-14 flex justify-between items-center px-4 py-2 bg-white rounded-xl">
                <span className="text-md font-semibold">이름</span>
                <div className="flex items-center gap-2">
                  <Input
                    className="flex-1 text-md "
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => onBlurUpdateName()}
                    maxLength={8}
                    placeholder="이름을 입력해주세요!"
                  />
                </div>
              </div>

              <div className="w-full flex px-4 py-2 justify-between items-center bg-white rounded-xl text-md ">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger
                      onClick={() => analyticsTrack("클릭_프로필_환경설정", {})}
                    >
                      <div className="w-full h-10 flex flex-grow justify-between items-center">
                        <span className="font-semibold">알림 설정</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="w-full flex flex-col p-2 gap-4 text-sm">
                        {kakaoMessageEnabled && (
                          <div className="w-full flex justify-between items-center bg-white rounded-xl">
                            <div className="flex items-center gap-1">
                              <span>카카오 메세지 전송</span>
                              <InfoBtn
                                text={[
                                  "기도 반응 할 때 상대방에게 카카오 메세지가 전송됩니다",
                                ]}
                                eventOption={{ where: "SettingDialog" }}
                              />
                            </div>
                            <Switch
                              defaultChecked={myProfile.kakao_notification}
                              onCheckedChange={() =>
                                onChangeKakaoNotificationToggle()
                              }
                            />
                          </div>
                        )}
                        <div className="w-full flex justify-between items-center bg-white rounded-xl">
                          <div className="flex items-center gap-1">
                            <span>모바일 푸시 알림</span>
                            <InfoBtn
                              text={[
                                "모바일에서 오늘의 기도 알림,",
                                "친구의 기도 알림을 받습니다",
                              ]}
                              eventOption={{ where: "SettingDialog" }}
                            />
                          </div>
                          <Switch
                            defaultChecked={myProfile.push_notification}
                            onCheckedChange={() =>
                              onChangePushNotificationToggle()
                            }
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div className="w-full flex px-4 py-2 justify-between items-center bg-white rounded-xl text-md ">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger
                      onClick={() =>
                        analyticsTrack("클릭_프로필_차단친구관리", {})
                      }
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
                            <UserProfile
                              profile={blockedProfile}
                              imgSize="w-6 h-6"
                              fontSize="font-medium"
                            />
                            <Badge
                              variant="outline"
                              onClick={() => onClickUnblock(blockedProfile.id)}
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
                    <AccordionTrigger
                      onClick={() => analyticsTrack("클릭_프로필_계정관리", {})}
                    >
                      <div className="w-full h-10 flex flex-grow justify-between items-center">
                        <span className="font-semibold flex-shrink-0">
                          계정 관리
                        </span>
                        <span className="flex-shrink text-sm p-2 max-w-56 whitespace-nowrap overflow-hidden text-ellipsis">
                          {user!.user_metadata.email}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="w-full flex p-2 gap-2 text-sm text-gray-400 text-end cursor-pointer justify-between">
                        <p onClick={() => onClickExitPrayU()}>회원탈퇴</p>
                        <p onClick={() => onClickSignOut()}>로그아웃</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default SettingDialog;
