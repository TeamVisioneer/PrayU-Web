import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useBlockedProfiles } from "@/queries/profile";
import useAuth from "@/hooks/useAuth";
import { analyticsTrack } from "@/analytics/analytics.ts";
import useBaseStore from "@/stores/baseStore";
import { Input } from "@/components/ui/input";
import { KakaoTokenRepo } from "@/components/kakao/KakaoTokenRepo.ts";
import { deleteUser } from "../../apis/user.ts";
import { useToast } from "../ui/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { UserProfile } from "@/components/profile/UserProfile.tsx";
// import InfoBtn from "@/components/alert/infoBtn.tsx";
import { Json } from "supabase/types/database";
import {
  AppSettings,
  DEFAULT_APP_SETTINGS,
} from "../../../supabase/types/tables.ts";

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
  const updateProfile = useBaseStore((state) => state.updateProfile);
  const getProfile = useBaseStore((state) => state.getProfile);
  const signOut = useBaseStore((state) => state.signOut);

  // 차단 목록은 다이얼로그가 열려 있고 차단이 있을 때만 조회한다 (docs/guides/data-fetching.md)
  const { data: blockedProfiles } = useBlockedProfiles(
    myProfile?.blocking_users ?? [],
    isOpenSettingDialog
  );
  const blockedProfileList = blockedProfiles ?? [];

  const { toast } = useToast();
  const [name, setName] = useState(myProfile?.full_name || "");

  // appSettings 상태를 AppSettings 타입으로 관리
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const currentSettings = myProfile?.app_settings as AppSettings;
    return {
      ...DEFAULT_APP_SETTINGS,
      ...currentSettings,
    };
  });

  // fontSize 설정을 위한 헬퍼 함수
  const setFontSize = async (fontSize: "small" | "medium" | "large") => {
    const updatedSettings = {
      ...appSettings,
      fontSize,
    };
    setAppSettings(updatedSettings);

    // 즉시 프로필 업데이트
    await updateProfile(user!.id, {
      app_settings: updatedSettings as Json,
    });
    await getProfile(user!.id);
  };

  if (!myProfile) return null;

  const onClickSignOut = () => {
    analyticsTrack("클릭_로그아웃", {});
    KakaoTokenRepo.cleanKakaoTokensInCookies();
    signOut();
  };

  const onBlurUpdateName = async () => {
    if (name.trim() === "") {
      setName(myProfile?.full_name || "");
      return;
    }
    if (name === myProfile?.full_name) return;
    await updateProfile(user!.id, {
      full_name: name,
    });
    await getProfile(user!.id);
    // onBlur 저장은 조용히 지나가면 저장 여부를 알 수 없다 — 결과를 말해준다
    toast({ description: "이름을 변경했어요" });
  };

  const onClickExitPrayU = () => {
    analyticsTrack("클릭_프로필_회원탈퇴", {});
    setAlertData({
      color: "bg-red-400 hover:bg-red-500",
      title: "회원 탈퇴",
      description:
        "계정을 탈퇴하시겠습니까?\n프로필 정보가 삭제되고 계정을 다시 사용할 수 없습니다.",
      actionText: "탈퇴하기",
      cancelText: "취소",
      onAction: async () => {
        // 탈퇴가 실패해도 로그아웃하면 사용자는 탈퇴됐다고 믿는다 — 반드시 결과를 본다
        const succeeded = await deleteUser();
        if (!succeeded) {
          toast({
            description: "탈퇴에 실패했어요. 잠시 후 다시 시도해 주세요",
          });
          return;
        }
        signOut();

        setTimeout(() => {
          window.location.href = "/";
        }, 100);
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
    // store 의 myProfile 을 갱신하면 blocking_users 가 바뀌고 → 쿼리 키가 바뀌어 목록이 따라온다
    await getProfile(myProfile.id);
  };

  const onClickOpenAppSettings = () => {
    analyticsTrack("클릭_프로필_앱설정", {});
    if (
      window.flutter_inappwebview &&
      window.flutter_inappwebview.callHandler
    ) {
      window.flutter_inappwebview.callHandler("openAppSettings");
    }
  };

  const fontSizeOptions = [
    { value: "small" as const, label: "작게" },
    { value: "medium" as const, label: "보통" },
    { value: "large" as const, label: "크게" },
  ];

  return (
    <Dialog
      open={isOpenSettingDialog}
      onOpenChange={(open) => {
        setIsOpenSettingDialog(open);
      }}
    >
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-11/12 h-auto overflow-auto rounded-2xl bg-mainBg"
      >
        {/* 헤더에는 제목만 — 본문을 DialogHeader 안에 넣지 않는다 (시맨틱) */}
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">설정</DialogTitle>
          <DialogDescription className="sr-only">
            계정과 앱 환경을 설정합니다
          </DialogDescription>
        </DialogHeader>

        <div className="flex w-full flex-col gap-3">
          <div className="flex h-14 w-full items-center justify-between gap-2 rounded-xl border border-glassBorder/50 bg-surfaceCard/70 px-4 shadow-member">
            <span className="shrink-0 text-base font-semibold text-black">
              이름
            </span>
            <Input
              className="flex-1 text-base"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => onBlurUpdateName()}
              maxLength={8}
              placeholder="이름을 입력해주세요!"
            />
          </div>

          <div className="flex h-14 w-full items-center justify-between rounded-xl border border-glassBorder/50 bg-surfaceCard/70 px-4 shadow-member">
            <span className="text-base font-semibold text-black">
              알림 설정
            </span>
            <button
              onClick={() => onClickOpenAppSettings()}
              className="text-sm text-accentFrom hover:text-accentTo"
            >
              열기
            </button>
          </div>

          {/* 펼침 항목은 하나의 Accordion — 한 번에 하나만 열린다 */}
          <Accordion
            type="single"
            collapsible
            className="flex w-full flex-col gap-3"
          >
            <AccordionItem
              value="font-size"
              className="rounded-xl border border-glassBorder/50 bg-surfaceCard/70 px-4 shadow-member"
            >
              <AccordionTrigger
                className="h-14 py-0"
                onClick={() => analyticsTrack("클릭_프로필_글씨크기설정", {})}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-base font-semibold text-black">
                    글씨 크기
                  </span>
                  <span className="p-2 text-sm text-dark">
                    {
                      fontSizeOptions.find(
                        (option) => option.value === appSettings.fontSize
                      )?.label
                    }
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex w-full flex-col gap-3 p-2 text-sm">
                  <div className="rounded-md bg-mainBg p-2 text-center text-xs text-dark">
                    글씨 크기 설정은 현재 기도카드 본문에만 적용됩니다.
                  </div>
                  {fontSizeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className="flex w-full items-center justify-between gap-2"
                      onClick={() => setFontSize(option.value)}
                    >
                      <span className="font-medium text-liteBlack">
                        {option.label}
                      </span>
                      <div
                        className={`h-4 w-4 rounded-full border-2 ${
                          appSettings.fontSize === option.value
                            ? "border-accentFrom bg-accentFrom"
                            : "border-deactivate"
                        }`}
                      >
                        {appSettings.fontSize === option.value && (
                          <div className="h-full w-full scale-50 rounded-full bg-white"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="blocked"
              className="rounded-xl border border-glassBorder/50 bg-surfaceCard/70 px-4 shadow-member"
            >
              <AccordionTrigger
                className="h-14 py-0"
                onClick={() => analyticsTrack("클릭_프로필_차단친구관리", {})}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-base font-semibold text-black">
                    차단친구 관리
                  </span>
                  <span className="p-2 text-sm text-dark">
                    {blockedProfileList.length} 명
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex w-full flex-col gap-4 px-2 py-2">
                  {blockedProfileList.length === 0 ? (
                    <p className="text-center text-sm text-dark">
                      차단한 친구가 없어요
                    </p>
                  ) : (
                    blockedProfileList.map((blockedProfile) => (
                      <div
                        key={blockedProfile.id}
                        className="flex w-full items-center justify-between"
                      >
                        <UserProfile
                          profile={blockedProfile}
                          imgSize="w-6 h-6"
                          fontSize="font-medium"
                        />
                        {/* 액션은 버튼으로 — Badge 는 라벨이지 눌리는 것이 아니다 */}
                        <button
                          type="button"
                          onClick={() => onClickUnblock(blockedProfile.id)}
                          className="rounded-full border border-glassBorder/70 bg-white px-3 py-1 text-xs font-medium text-liteBlack transition-colors active:bg-mainBg"
                        >
                          차단 해제
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="account"
              className="rounded-xl border border-glassBorder/50 bg-surfaceCard/70 px-4 shadow-member"
            >
              <AccordionTrigger
                className="h-14 py-0"
                onClick={() => analyticsTrack("클릭_프로필_계정관리", {})}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="shrink-0 text-base font-semibold text-black">
                    계정 관리
                  </span>
                  <span className="max-w-56 overflow-hidden text-ellipsis whitespace-nowrap p-2 text-sm text-dark">
                    {user!.user_metadata.email}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex w-full justify-end gap-6 p-2 text-sm">
                  <button
                    className="text-dark hover:text-black"
                    onClick={onClickSignOut}
                  >
                    로그아웃
                  </button>
                  <button
                    className="text-liteRed hover:text-red-600"
                    onClick={onClickExitPrayU}
                  >
                    회원탈퇴
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* 프로필 하단 푸터에 있던 약관·저작권 — 설정으로 이동 (화면은 콘텐츠에 집중) */}
          <div className="flex flex-col items-center gap-1.5 pb-1 pt-3 text-center text-xs text-dark">
            <div className="flex justify-center gap-2">
              <a
                href="https://plip.kr/pcc/e117f200-873e-4090-8234-08d0116f9d03/privacy/1.html"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                개인정보 처리방침
              </a>
              <span>|</span>
              <a href="/term/240909" className="hover:underline">
                이용약관
              </a>
            </div>
            <div>© {new Date().getFullYear()} PrayU. All rights reserved.</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingDialog;
