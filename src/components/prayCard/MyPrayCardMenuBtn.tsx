import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RiMoreFill } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { LuCopy } from "react-icons/lu";
import { MdIosShare } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { analyticsTrack } from "@/analytics/analytics";
import useBaseStore from "@/stores/baseStore";
import { toast } from "../ui/use-toast";
import { deletePrayCard } from "@/apis/prayCard";
import { KakaoTokenRepo } from "../kakao/KakaoTokenRepo";
import { KakaoController } from "../kakao/KakaoController";
import {
  KakaoMessageObject,
  KakaoSendMessageResponse,
  SelectedUsers,
} from "../kakao/Kakao";
import { getDomainUrl } from "@/lib/utils";

interface MyMoreBtnProps {
  handleEditClick: () => void;
  prayCardId: string;
}

const MyPrayCardMenuBtn: React.FC<MyMoreBtnProps> = ({
  handleEditClick,
  prayCardId,
}) => {
  const inputPrayCardContent = useBaseStore(
    (state) => state.inputPrayCardContent
  );
  const setAlertData = useBaseStore((state) => state.setAlertData);
  const setIsConfirmAlertOpen = useBaseStore(
    (state) => state.setIsConfirmAlertOpen
  );
  const targetGroup = useBaseStore((state) => state.targetGroup);
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

  const onClickSharePrayCard = async (targetGroupId: string) => {
    const kakaoToken = await KakaoTokenRepo.init(
      `groupId:${targetGroupId};from:MyPrayCard`
    );
    if (!kakaoToken) return null;
    const baseUrl = getDomainUrl();
    const kakaoMessage: KakaoMessageObject = {
      object_type: "feed",
      content: {
        title: "📮 PrayU 공유 알림",
        description: "오늘의 기도를 통해 공유된 기도제목을 확인해 주세요",
        image_url:
          "https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/PrayCardPrayU.png",
        image_width: 800,
        image_height: 600,
        link: {
          web_url: baseUrl,
          mobile_web_url: baseUrl,
        },
      },
      buttons: [
        {
          title: "오늘의 기도 시작",
          link: {
            mobile_web_url: window.location.href,
            web_url: window.location.href,
          },
        },
      ],
    };

    const selectFriendsResponse: SelectedUsers | null =
      await KakaoController.selectUsers();
    if (selectFriendsResponse?.users) {
      const friendsUUID = selectFriendsResponse.users.map(
        (friends) => friends.uuid
      );
      const sendMessageResponse: KakaoSendMessageResponse | null =
        await KakaoController.sendMessageForFriends(kakaoMessage, friendsUUID);
      if (sendMessageResponse) {
        toast({
          description: `📮 ${sendMessageResponse.successful_receiver_uuids.length}명의 친구들에게 기도제목 공유 메세지를 보냈어요`,
        });
      }
    }
    analyticsTrack("클릭_기도카드_공유", {});
  };

  const onClickDeletePrayCard = () => {
    setAlertData({
      title: "내 기도제목 삭제하기",
      description: `내 기도제목이 없으면 친구들에게 기도를 해줄 수 없어요! \n삭제한 후 새로 작성해 보아요:)`,
      actionText: "삭제하기",
      cancelText: "취소",
      onAction: async () => {
        await deletePrayCard(prayCardId);
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
          onClick={() => onClickSharePrayCard(targetGroup!.id)}
        >
          <MdIosShare />
          공유하기
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
