import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useBaseStore from "@/stores/baseStore";
import { FiEdit } from "react-icons/fi";
import { LuCopy } from "react-icons/lu";
import { RiMoreFill, RiDeleteBin6Line } from "react-icons/ri";
import { analyticsTrack } from "@/analytics/analytics";
import { toast } from "../ui/use-toast";
import { deletePrayCard } from "@/apis/prayCard";
import { KakaoTokenRepo } from "../kakao/KakaoTokenRepo";
import { KakaoController } from "../kakao/KakaoController";
import { MdMailOutline } from "react-icons/md";
import { PrayCardWithProfiles } from "supabase/types/tables";
import { PrayRequestMessage } from "../kakao/KakaoMessage";

interface MyMoreBtnProps {
  handleEditClick: () => void;
  prayCard: PrayCardWithProfiles;
}

const MyPrayCardMenuBtn: React.FC<MyMoreBtnProps> = ({
  handleEditClick,
  prayCard,
}) => {
  const inputPrayCardContent = useBaseStore(
    (state) => state.inputPrayCardContent
  );
  const setAlertData = useBaseStore((state) => state.setAlertData);
  const setIsConfirmAlertOpen = useBaseStore(
    (state) => state.setIsConfirmAlertOpen
  );
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const myMember = useBaseStore((state) => state.myMember);
  if (!targetGroup || !myMember) return null;

  const onClickCopyPrayCard = () => {
    if (!inputPrayCardContent) {
      toast({
        description: "⚠︎ 기도제목을 작성해주세요",
      });
      return;
    }
    navigator.clipboard
      .writeText(inputPrayCardContent)
      .then(() => {
        toast({
          description: "기도제목이 복사되었어요 🔗",
        });
      })
      .catch((err) => {
        console.error("복사하는 중 오류가 발생했습니다: ", err);
      });

    analyticsTrack("클릭_기도카드_복사", {});
  };

  const onClickPrayRequest = async () => {
    const hasKakaoScope = await KakaoController.checkKakaoScope();
    if (hasKakaoScope) await sendPrayRequestMessage();
    else {
      setAlertData({
        color: "bg-mainBtn",
        title: "메세지 전송 동의",
        description: `그룹원들과 카카오톡으로 기도요청 메세지를 보내요!`,
        actionText: "계속하기",
        cancelText: "취소",
        onAction: async () => {
          await KakaoTokenRepo.openKakaoLoginPage(targetGroup.id, "MyPrayCard");
        },
      });
      setIsConfirmAlertOpen(true);
    }
    analyticsTrack("클릭_기도카드_기도요청", {});
  };

  const sendPrayRequestMessage = async () => {
    const selectFriendsResponse = await KakaoController.selectUsers();
    if (selectFriendsResponse?.users) {
      const myUUID = selectFriendsResponse.users.find(
        (user) => user.id == myMember.profiles.kakao_id
      )?.uuid;
      const friendsUUID = selectFriendsResponse.users
        .filter((user) => user.uuid != myUUID)
        .map((user) => user.uuid);

      const message = PrayRequestMessage(myMember.profiles.full_name);
      const myMessageResponse = myUUID
        ? await KakaoController.sendMessageForMe(message)
        : null;
      const friendsMessageResponse =
        await KakaoController.sendMessageForFriends(message, friendsUUID);

      if (myMessageResponse || friendsMessageResponse) {
        const successedCount =
          (myMessageResponse ? 1 : 0) +
          (friendsMessageResponse
            ? friendsMessageResponse.successful_receiver_uuids.length
            : 0);
        toast({
          description: `📮 ${successedCount}명의 친구들에게 기도요청 메세지를 보냈어요`,
        });
      }
    }
  };

  const onClickDeletePrayCard = () => {
    setAlertData({
      color: "bg-red-400",
      title: "내 기도제목 삭제하기",
      description: `내 기도제목이 없으면 친구들에게 기도를 해줄 수 없어요! \n삭제한 후 새로 작성해 보아요:)`,
      actionText: "삭제하기",
      cancelText: "취소",
      onAction: async () => {
        await deletePrayCard(prayCard.id);
        window.location.reload();
        analyticsTrack("클릭_기도카드_삭제", {});
      },
    });
    setIsConfirmAlertOpen(true);
    return;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={() => {
          analyticsTrack("클릭_기도카드_더보기", {});
        }}
      >
        <RiMoreFill className="text-2xl" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          className="flex justify-between"
          onClick={() => {
            setTimeout(() => {
              handleEditClick();
            }, 180);
          }}
        >
          <FiEdit />
          수정하기
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex justify-between"
          onClick={() => onClickCopyPrayCard()}
        >
          <LuCopy />
          복사하기
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex justify-between"
          onClick={() => onClickPrayRequest()}
        >
          <MdMailOutline />
          기도요청
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex justify-between text-red-600"
          onClick={() => onClickDeletePrayCard()}
        >
          <RiDeleteBin6Line />
          삭제하기
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MyPrayCardMenuBtn;
