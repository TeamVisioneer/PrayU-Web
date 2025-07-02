import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "../ui/use-toast";
import useBaseStore from "@/stores/baseStore";
import { analyticsTrack } from "@/analytics/analytics";
import { SlMenu } from "react-icons/sl";
import { IoRemoveCircleOutline } from "react-icons/io5";
import { IoAddCircleOutline } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { IoPersonCircleOutline } from "react-icons/io5";
import GroupMemberProfileList from "./GroupMemberProfileList";
import { ChevronsUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PiHandsPrayingFill } from "react-icons/pi";
import kakaoIcon from "@/assets/kakaoIcon.svg";

const GroupMenuBtn: React.FC = () => {
  const user = useBaseStore((state) => state.user);
  const navigate = useNavigate();
  const deleteMemberbyGroupId = useBaseStore(
    (state) => state.deleteMemberbyGroupId
  );
  const deletePrayCardByGroupId = useBaseStore(
    (state) => state.deletePrayCardByGroupId
  );
  const setAlertData = useBaseStore((state) => state.setAlertData);
  const maxGroupCount = Number(import.meta.env.VITE_MAX_GROUP_COUNT);
  const { toast } = useToast();
  const setIsConfirmAlertOpen = useBaseStore(
    (state) => state.setIsConfirmAlertOpen
  );
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const groupList = useBaseStore((state) => state.groupList);
  const userPlan = useBaseStore((state) => state.userPlan);
  const isOpenGroupMenuSheet = useBaseStore(
    (state) => state.isOpenGroupMenuSheet
  );
  const setIsOpenGroupMenuSheet = useBaseStore(
    (state) => state.setIsOpenGroupMenuSheet
  );
  const setIsOpenGroupSettingsDialog = useBaseStore(
    (state) => state.setIsOpenGroupSettingsDialog
  );
  const setActiveGroupMemberOption = useBaseStore(
    (state) => state.setActiveGroupMemberOption
  );
  const isGroupLeader = useBaseStore((state) => state.isGroupLeader);
  const memberList = useBaseStore((state) => state.memberList);
  const setIsOpenGroupListDrawer = useBaseStore(
    (state) => state.setIsOpenGroupListDrawer
  );
  const fetchGroupListByUserId = useBaseStore(
    (state) => state.fetchGroupListByUserId
  );
  const setExternalUrl = useBaseStore((state) => state.setExternalUrl);

  const isGroupListPage = window.location.pathname === "/group";

  const handleClickCreateGroup = () => {
    if (!groupList) return;
    if (groupList.length < maxGroupCount || userPlan === "Premium") {
      window.location.href = "/group/new";
      analyticsTrack("클릭_그룹_추가", { group_length: groupList.length });
    } else {
      toast({
        description: `최대 ${maxGroupCount}개의 그룹만 참여할 수 있어요`,
      });
    }
  };

  const handleClickExitGroup = () => {
    if (!targetGroup || !user || !memberList) return;
    if (isGroupLeader && memberList.length !== 1) {
      setAlertData({
        color: "bg-blue-400",
        title: "그룹장 양도 필요",
        description:
          "그룹장은 그룹을 나갈 수 없어요\n 그룹장 양도를 먼저 진행해주세요!",
        actionText: "그룹 설정하기",
        cancelText: "취소",
        onAction: async () => {
          setIsConfirmAlertOpen(false);
          setActiveGroupMemberOption("assign");
          setIsOpenGroupSettingsDialog(true);
        },
      });
      setIsConfirmAlertOpen(true);
      return null;
    }
    setAlertData({
      color: "bg-red-400",
      title: "그룹 나가기",
      description: `더 이상 ${targetGroup.name}의 기도를 받을 수 없어요 😭`,
      actionText: "나가기",
      cancelText: "취소",
      onAction: async () => {
        await deleteMemberbyGroupId(user!.id, targetGroup.id);
        await deletePrayCardByGroupId(user!.id, targetGroup.id);
        window.location.replace("/");
        analyticsTrack("클릭_그룹_나가기", { group_id: targetGroup.id });
      },
    });
    setIsConfirmAlertOpen(true);
  };

  const handleClickUpdateGroup = () => {
    setIsOpenGroupMenuSheet(false);
    setIsOpenGroupSettingsDialog(true);
  };

  const onClickContactUs = () => {
    setIsOpenGroupMenuSheet(false);
    analyticsTrack("클릭_문의", {});
    window.open(import.meta.env.VITE_PRAY_KAKAO_CHANNEL_CHAT_URL, "_blank");
  };

  const onClickSheetTrigeer = () => {
    analyticsTrack("클릭_그룹_메뉴", {});
    setActiveGroupMemberOption("none");
  };

  const onClickOpenNotice = () => {
    setIsOpenGroupMenuSheet(false);
    analyticsTrack("클릭_카카오_소식", {});
    setExternalUrl("https://pf.kakao.com/_XaHDG/posts");
  };
  const onClickOpenTutorial = () => {
    setIsOpenGroupMenuSheet(false);
    analyticsTrack("클릭_튜토리얼", {});
    navigate("/tutorial");
  };

  const onClickGroupName = async () => {
    setIsOpenGroupListDrawer(true);
    if (user) await fetchGroupListByUserId(user!.id);
    analyticsTrack("클릭_그룹_이름", { where: "GroupMenuBtn" });
  };

  const onClickGroupHome = () => {
    setIsOpenGroupMenuSheet(false);
    analyticsTrack("클릭_그룹_홈", { where: "GroupMenuBtn" });
    navigate("/group");
  };

  const onClickPrayUHome = () => {
    setIsOpenGroupMenuSheet(false);
    analyticsTrack("클릭_홈", { where: "GroupMenuBtn" });
    navigate("/");
  };

  const onClickQT = () => {
    setIsOpenGroupMenuSheet(false);
    analyticsTrack("클릭_QT_페이지", { where: "GroupMenuBtn" });
    navigate("/qt");
  };

  const onClickBibleCard = () => {
    setIsOpenGroupMenuSheet(false);
    analyticsTrack("클릭_말씀카드_페이지", { where: "GroupMenuBtn" });
    navigate("/bible-card");
  };

  const onClickMyProfile = () => {
    setIsOpenGroupMenuSheet(false);
    analyticsTrack("클릭_프로필_나", { where: "GroupMenuBtn" });
    navigate("/profile/me", { replace: true });
  };

  const requestStorePage = () => {
    if (navigator.userAgent.match(/Android/i)) {
      window.location.href =
        "https://play.google.com/store/apps/details?id=com.team.visioneer.prayu";
    } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
      window.location.href =
        "https://itunes.apple.com/kr/app/apple-store/id6711345171";
    } else {
      window.location.href = "https://linktr.ee/prayu.site";
    }
  };

  const onClickAppReview = async () => {
    setIsOpenGroupMenuSheet(false);
    analyticsTrack("클릭_앱_리뷰", {});
    if (
      window.flutter_inappwebview &&
      window.flutter_inappwebview.callHandler
    ) {
      const result: unknown = await window.flutter_inappwebview.callHandler(
        "requestAppReview"
      );
      if (result !== "success") requestStorePage();
    } else {
      requestStorePage();
    }
  };

  return (
    <Sheet
      open={isOpenGroupMenuSheet}
      onOpenChange={(open) => {
        setIsOpenGroupMenuSheet(open);
        if (!open && window.history.state?.open === true) window.history.back();
      }}
    >
      <SheetTrigger
        className="flex flex-col items-end focus:outline-none p-0"
        onClick={() => onClickSheetTrigeer()}
      >
        <SlMenu size={20} />
      </SheetTrigger>
      <SheetContent className="max-w-[288px] mx-auto w-[60%] px-5 pt-10 flex flex-col items-start overflow-y-auto no-scrollbar bg-mainBg">
        <div className="flex flex-col w-full">
          <div className="flex-1">
            <SheetHeader>
              <SheetTitle></SheetTitle>
              <SheetDescription></SheetDescription>
            </SheetHeader>

            <div
              className="max-w-full w-auto flex items-center py-3 border-none font-bold text-[#222222] text-xl gap-1 cursor-pointer"
              onClick={() => onClickGroupName()}
            >
              <span className="truncate">
                {targetGroup && !isGroupListPage ? targetGroup.name : "그룹"}
              </span>
              <ChevronsUpDown size={20} className="opacity-50 shrink-0" />
            </div>

            <div className="flex flex-col items-start text-gray-500 w-full">
              {memberList && targetGroup && !isGroupListPage && (
                <section className="w-full pt-5 border-t border-gray-200">
                  <GroupMemberProfileList
                    memberList={memberList}
                    targetGroup={targetGroup}
                  />
                </section>
              )}
              <section className="w-full flex flex-col gap-4 py-5 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <IoPersonCircleOutline size={20} color="#222222" />
                  <a
                    onClick={() => onClickMyProfile()}
                    className="cursor-pointer text-[#222222] font-medium"
                  >
                    내 프로필
                  </a>
                </div>
                {/* 그룹 홈 */}
                <div className="flex items-center gap-2">
                  <PiHandsPrayingFill size={20} color="#222222" />
                  <a
                    className="cursor-pointer text-[#222222] font-medium"
                    onClick={() => onClickGroupHome()}
                  >
                    그룹 홈
                  </a>
                </div>

                {targetGroup && !isGroupListPage && (
                  <>
                    <div className="flex items-center gap-2">
                      <IoAddCircleOutline size={20} color="#222222" />
                      <a
                        className="cursor-pointer text-[#222222] font-medium"
                        onClick={() => handleClickCreateGroup()}
                      >
                        그룹 만들기
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <IoRemoveCircleOutline size={20} color="#222222" />
                      <a
                        className="cursor-pointer text-[#222222] font-medium"
                        onClick={() => handleClickExitGroup()}
                      >
                        그룹 나가기
                      </a>
                    </div>
                    {isGroupLeader && (
                      <div className="flex items-center gap-2">
                        <IoSettingsOutline size={20} color="#222222" />
                        <a
                          className="cursor-pointer text-[#222222] font-medium"
                          onClick={() => handleClickUpdateGroup()}
                        >
                          그룹 설정
                        </a>
                      </div>
                    )}
                  </>
                )}
              </section>
              <section className="w-full flex flex-col gap-4 py-5 border-t border-gray-200">
                <a onClick={() => onClickPrayUHome()}>PrayU 홈</a>
                <a onClick={() => onClickOpenNotice()}>공지사항</a>
                <a onClick={() => onClickQT()}>나만의 QT</a>
                <a onClick={() => onClickBibleCard()}>말씀카드 만들기</a>
                <a onClick={() => onClickAppReview()}>앱 리뷰</a>
                <a onClick={() => onClickOpenTutorial()}>가이드</a>
              </section>
            </div>
          </div>

          {/* 카카오톡 톡상담 버튼 */}
          <section
            onClick={() => onClickContactUs()}
            className="sticky bottom-0"
          >
            <div className="flex items-center bg-[#FFE812] text-black rounded-full px-2 shadow-md">
              <div className="w-12 h-12 pl-3 py-3 rounded-full flex items-center justify-center">
                <img src={kakaoIcon} className="w-full h-full rounded-full" />
              </div>
              <span className="w-full text-center font-semibold pr-3">
                <span className="hidden min-[360px]:inline">
                  카카오톡 문의하기
                </span>
                <span className="min-[360px]:hidden">톡문의</span>
              </span>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default GroupMenuBtn;
