import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "../ui/use-toast";
import { Group } from "supabase/types/tables";
import useBaseStore from "@/stores/baseStore";
import { analyticsTrack } from "@/analytics/analytics";
import { SlMenu } from "react-icons/sl";
import { IoRemoveCircleOutline } from "react-icons/io5";
import { IoAddCircleOutline } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { IoPersonCircleOutline } from "react-icons/io5";
import newIcon from "@/assets/newIcon.svg";
import GroupMemberProfileList from "./GroupMemberProfileList";
import { ChevronsUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PiHandsPrayingFill } from "react-icons/pi";

interface GroupMenuBtnProps {
  userGroupList: Group[];
  targetGroup?: Group;
}

const GroupMenuBtn: React.FC<GroupMenuBtnProps> = ({
  userGroupList,
  targetGroup,
}) => {
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

  const handleClickCreateGroup = () => {
    if (userGroupList.length < maxGroupCount || userPlan === "Premium") {
      window.location.href = "/group/new";
      analyticsTrack("클릭_그룹_추가", { group_length: userGroupList.length });
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
  };

  const onClickSheetTrigeer = () => {
    analyticsTrack("클릭_그룹_메뉴", {});
    setActiveGroupMemberOption("none");
  };

  const onClickOpenNotice = () => {
    setIsOpenGroupMenuSheet(false);
    analyticsTrack("클릭_카카오_소식", {});
    window.location.href = "https://pf.kakao.com/_XaHDG/posts";
  };
  const onClickOpenTutorial = () => {
    setIsOpenGroupMenuSheet(false);
    analyticsTrack("클릭_튜토리얼", {});
    navigate("/tutorial");
  };

  const onClickGroupName = () => {
    setIsOpenGroupListDrawer(true);
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
    navigate("/profile/me");
  };

  return (
    <Sheet open={isOpenGroupMenuSheet} onOpenChange={setIsOpenGroupMenuSheet}>
      <SheetTrigger
        className="flex flex-col items-end focus:outline-none p-0"
        onClick={() => onClickSheetTrigeer()}
      >
        <SlMenu size={20} />
      </SheetTrigger>
      <SheetContent className="max-w-[288px] mx-auto w-[60%] px-5 py-10 flex flex-col items-start overflow-y-auto no-scrollbar bg-mainBg">
        <SheetHeader>
          <SheetTitle></SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>

        <div
          className="max-w-full w-auto flex items-center py-3 border-none font-bold text-[#222222] text-xl gap-1 cursor-pointer"
          onClick={() => onClickGroupName()}
        >
          <span className="truncate">{targetGroup?.name || "그룹"}</span>
          <ChevronsUpDown size={20} className="opacity-50 shrink-0" />
        </div>

        <div className="flex flex-col items-start text-gray-500 w-full">
          {memberList && targetGroup && (
            <section className="w-full py-5 border-t border-gray-200">
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
              <img src={newIcon} />
            </div>

            {targetGroup && (
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
            <div className="flex gap-1 items-center">
              <a onClick={() => onClickQT()}>나만의 QT</a>
              <img src={newIcon} />
            </div>
            <div className="flex gap-1 items-center">
              <a onClick={() => onClickBibleCard()}>말씀카드 만들기</a>
              <img src={newIcon} />
            </div>
            <a className="cursor-pointer" onClick={() => onClickOpenNotice()}>
              공지사항
            </a>
            <a
              href={`${import.meta.env.VITE_PRAY_KAKAO_CHANNEL_CHAT_URL}`}
              onClick={() => onClickContactUs()}
            >
              문의하기
            </a>
            <a className="cursor-pointer" onClick={() => onClickOpenTutorial()}>
              가이드
            </a>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default GroupMenuBtn;
