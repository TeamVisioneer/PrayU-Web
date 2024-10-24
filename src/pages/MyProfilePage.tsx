import useAuth from "@/hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import SettingDialog from "@/components/profile/SettingDialog";
import { useEffect } from "react";
import { IoChevronBack } from "react-icons/io5";
import { Skeleton } from "@/components/ui/skeleton";
import { IoSettingsOutline } from "react-icons/io5";

const MyProfilePage = () => {
  const { user } = useAuth();

  const myProfile = useBaseStore((state) => state.myProfile);
  const profileList = useBaseStore((state) => state.profileList);
  const getProfile = useBaseStore((state) => state.getProfile);
  const fetchProfileList = useBaseStore((state) => state.fetchProfileList);
  const setIsOpenSettingDialog = useBaseStore(
    (state) => state.setIsOpenSettingDialog
  );

  useEffect(() => {
    getProfile(user!.id);
  }, [user, getProfile]);

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
    console.log("gg");
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
      {/* <div className="w-full flex flex-col items-center gap-4 ">
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
                        <Popover>
                          <PopoverTrigger
                            onClick={() =>
                              analyticsTrack("클릭_프로필_카카오메세지설명", {})
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
                  )}
                  <div className="w-full flex justify-between items-center bg-white rounded-xl">
                    <div className="flex items-center gap-1">
                      <span>모바일 푸시 알림</span>
                      <Popover>
                        <PopoverTrigger
                          onClick={() =>
                            analyticsTrack("클릭_프로필_푸시알림설명", {})
                          }
                        >
                          <LuInfo size={16} color="gray" />
                        </PopoverTrigger>
                        <PopoverContent className="p-3 w-48">
                          <span className="text-sm text-gray-500">
                            모바일에서 오늘의 기도 알림,
                          </span>
                          <br />
                          <span className="text-sm text-gray-500">
                            친구의 기도 알림을 받습니다
                          </span>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Switch
                      defaultChecked={myProfile.push_notification}
                      onCheckedChange={() => onChangePushNotificationToggle()}
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
                  <span className="font-semibold">계정 관리</span>
                  <span className="text-sm p-2 max-w-56 whitespace-nowrap overflow-hidden text-ellipsis">
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
      </div> */}

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
