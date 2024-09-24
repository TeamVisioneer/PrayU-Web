import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useToast } from "../ui/use-toast";
import { Group } from "supabase/types/tables";
import useBaseStore from "@/stores/baseStore";
import { analyticsTrack } from "@/analytics/analytics";
import { SlMenu } from "react-icons/sl";
import addGroup from "@/assets/addGroup.svg";
import minusGroup from "@/assets/minusGroup.svg";
import newIcon from "@/assets/newIcon.svg";
import groupIcon from "@/assets/groupIcon.svg";

import { KakaoTokenRepo } from "../kakao/KakaoTokenRepo";

interface GroupMenuBtnProps {
  userGroupList: Group[];
  targetGroup?: Group;
}

const GroupMenuBtn: React.FC<GroupMenuBtnProps> = ({
  userGroupList,
  targetGroup,
}) => {
  const user = useBaseStore((state) => state.user);
  const deleteMemberbyGroupId = useBaseStore(
    (state) => state.deleteMemberbyGroupId
  );
  const deletePrayCardByGroupId = useBaseStore(
    (state) => state.deletePrayCardByGroupId
  );
  const setAlertData = useBaseStore((state) => state.setAlertData);
  const maxGroupCount = Number(import.meta.env.VITE_MAX_GROUP_COUNT);
  const { toast } = useToast();
  const signOut = useBaseStore((state) => state.signOut);
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

  const handleClickExitGroup = (groupId: string, groupName: string | null) => {
    setAlertData({
      color: "bg-red-400",
      title: "그룹 나가기",
      description: `더 이상 ${groupName}의 기도를 받을 수 없어요 😭`,
      actionText: "나가기",
      cancelText: "취소",
      onAction: async () => {
        await deleteMemberbyGroupId(user!.id, groupId);
        await deletePrayCardByGroupId(user!.id, groupId);
        window.location.replace("/");
        analyticsTrack("클릭_그룹_나가기", { group_id: groupId });
      },
    });
    setIsConfirmAlertOpen(true);
  };

  const onClickOtherGroup = (groupId: string) => {
    analyticsTrack("클릭_그룹_전환", { group_id: groupId });
    window.location.href = `/group/${groupId}`;
  };

  const onClickContactUs = () => {
    analyticsTrack("클릭_문의", {});
  };

  const onClickSheetTrigeer = () => {
    window.history.pushState(null, "", window.location.pathname);
    analyticsTrack("클릭_그룹_메뉴", {});
  };

  const onClickOpenNotice = () => {
    analyticsTrack("클릭_카카오_소식", {});
    window.location.href = "http://pf.kakao.com/_XaHDG/posts";
  };

  const onClickSignOut = () => {
    analyticsTrack("클릭_로그아웃", {});
    KakaoTokenRepo.cleanKakaoTokensInCookies();
    signOut();
  };

  return (
    <Sheet open={isOpenGroupMenuSheet} onOpenChange={setIsOpenGroupMenuSheet}>
      <SheetTrigger
        className="flex flex-col items-end focus:outline-none"
        onClick={() => onClickSheetTrigeer()}
      >
        <SlMenu size={20} />
      </SheetTrigger>
      <SheetContent className="max-w-[288px] mx-auto w-[60%] px-5 py-16 flex flex-col items-start overflow-y-auto no-scrollbar">
        <SheetHeader className="w-full">
          <SheetTitle className="flex items-center gap-2 text-left text-[#222222]">
            <img src={groupIcon} />
            <p>PrayU 그룹</p>
          </SheetTitle>
          <hr className="w-full" />
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 items-start text-gray-500 w-full">
          {userGroupList.map((group) => (
            <div key={group.id} className="flex items-center gap-1">
              <span
                className={`w-[5px] h-[18px]  rounded-md ${
                  group.id == targetGroup?.id ? "bg-mainBtn" : ""
                }`}
              ></span>
              <a
                key={group.id}
                onClick={() => onClickOtherGroup(group.id)}
                className={`cursor-pointer max-w-40 whitespace-nowrap overflow-hidden text-ellipsis ${
                  group.id == targetGroup?.id ? "font-bold text-[#222222]" : ""
                }`}
              >
                {group.name}
              </a>
            </div>
          ))}
          <hr className="w-full" />
          {targetGroup && (
            <>
              <div className="flex items-center gap-2">
                <img src={addGroup} />
                <a
                  className="cursor-pointer text-[#222222] font-medium"
                  onClick={() => handleClickCreateGroup()}
                >
                  그룹 만들기
                </a>
              </div>
              <div className="flex items-center gap-2">
                <img src={minusGroup} />
                <a
                  className="cursor-pointer text-[#222222] font-medium"
                  onClick={() =>
                    handleClickExitGroup(targetGroup.id, targetGroup.name)
                  }
                >
                  그룹 나가기
                </a>
              </div>
            </>
          )}
          <hr className="w-full" />
          <div className="flex gap-2 items-center">
            <a
              href="/profile/me"
              onClick={() => analyticsTrack("클릭_프로필_나", {})}
            >
              내 정보
            </a>
          </div>

          <a href="/" onClick={() => analyticsTrack("클릭_공유_도메인", {})}>
            PrayU 홈
          </a>
          <div className="flex gap-1 items-center">
            <a onClick={() => onClickOpenNotice()}>PrayU 소식</a>
            <img src={newIcon} />
          </div>

          <div className="flex gap-2 items-center">
            <a
              href={`${import.meta.env.VITE_PRAY_KAKAO_CHANNEL_CHAT_URL}`}
              onClick={() => onClickContactUs()}
            >
              PrayU 문의
            </a>
          </div>

          <a className="cursor-pointer" onClick={() => onClickSignOut()}>
            로그아웃
          </a>
        </div>
        <SheetClose className="focus:outline-none"></SheetClose>
      </SheetContent>
    </Sheet>
  );
};

export default GroupMenuBtn;
