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
  handleEditClick?: () => void;
  prayCard: PrayCardWithProfiles;
}

const MyPrayCardMenuBtn: React.FC<MyMoreBtnProps> = ({
  handleEditClick,
  prayCard,
}) => {
  const setAlertData = useBaseStore((state) => state.setAlertData);
  const setIsConfirmAlertOpen = useBaseStore(
    (state) => state.setIsConfirmAlertOpen
  );
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const myMember = useBaseStore((state) => state.myMember);
  const updateMember = useBaseStore((state) => state.updateMember);
  const fetchUserPrayCardListByGroupId = useBaseStore(
    (state) => state.fetchUserPrayCardListByGroupId
  );

  const onClickCopyPrayCard = () => {
    if (!prayCard.content) {
      toast({
        description: "⚠︎ 기도제목이 작성되어 있지 않아요",
      });
      return;
    }
    navigator.clipboard
      .writeText(
        `📌일상 나눔\n${prayCard.life}\n\n📝기도제목\n${prayCard.content}`
      )
      .then(() => {
        toast({
          description: "🔗 기도카드 내용이 복사되었어요",
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
        title: "카카오톡 전송 권한 확인",
        description: `친구들과 카카오톡으로 기도요청 메세지를 보내요!`,
        actionText: "계속하기",
        cancelText: "취소",
        onAction: async () => {
          const state = `groupId:${targetGroup?.id};from:MyPrayCard`;
          const token = await KakaoTokenRepo.init();
          if (token) await sendPrayRequestMessage();
          else KakaoTokenRepo.openKakaoLoginPageWithKakao(state);
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
        (user) => user.id == myMember?.profiles.kakao_id
      )?.uuid;
      const friendsUUID = selectFriendsResponse.users
        .filter((user) => user.uuid != myUUID)
        .map((user) => user.uuid);

      const message = PrayRequestMessage(myMember?.profiles.full_name || "");
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
      title: "기도카드 삭제하기",
      description: `기도카드를 삭제하면 다시 복구할 수 없어요!`,
      actionText: "삭제하기",
      cancelText: "취소",
      onAction: async () => {
        const isDeleted = await deletePrayCard(prayCard.id);
        const userPrayCardList = await fetchUserPrayCardListByGroupId(
          myMember?.user_id || "",
          myMember?.group_id || ""
        );
        const praySummary = userPrayCardList?.[0]?.content || "";
        if (isDeleted && myMember) await updateMember(myMember.id, praySummary);
        window.location.reload();
        analyticsTrack("클릭_기도카드_삭제", {});
      },
    });
    setIsConfirmAlertOpen(true);
    return;
  };

  const canPrayRequest = false;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="focus:outline-none"
        onClick={() => {
          analyticsTrack("클릭_기도카드_더보기", {});
        }}
      >
        <RiMoreFill className="text-2xl" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {handleEditClick && (
          <>
            <DropdownMenuItem
              className="flex justify-between"
              onClick={() => handleEditClick()}
            >
              <FiEdit />
              수정하기
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          className="flex justify-between"
          onClick={() => onClickCopyPrayCard()}
        >
          <LuCopy />
          복사하기
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        {canPrayRequest && (
          <>
            <DropdownMenuItem
              className="flex justify-between"
              onClick={() => onClickPrayRequest()}
            >
              <MdMailOutline />
              기도요청
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

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
