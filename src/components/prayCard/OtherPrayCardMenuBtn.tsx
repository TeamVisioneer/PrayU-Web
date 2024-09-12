import React, { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MdBlock } from "react-icons/md";
import { RiMoreFill } from "react-icons/ri";
import { MdReportGmailerrorred } from "react-icons/md";

import { analyticsTrack } from "@/analytics/analytics";
import useBaseStore from "@/stores/baseStore";

interface OtherPrayCardMenuBtnProps {
  targetUserId: string;
  prayContent: string;
}

const OtherPrayCardMenuBtn: React.FC<OtherPrayCardMenuBtnProps> = ({
  targetUserId,
  prayContent,
}) => {
  const myMember = useBaseStore((state) => state.myMember);
  const setReportData = useBaseStore((state) => state.setReportData);
  const setIsReportAlertOpen = useBaseStore(
    (state) => state.setIsReportAlertOpen
  );
  const setIsConfirmAlertOpen = useBaseStore(
    (state) => state.setIsConfirmAlertOpen
  );
  const setAlertData = useBaseStore((state) => state.setAlertData);
  const updateProfile = useBaseStore((state) => state.updateProfile);

  useEffect(() => {
    setReportData({
      currentUserId: myMember?.user_id || "",
      targetUserId: targetUserId,
      content: prayContent,
    });
  }, [myMember, targetUserId, prayContent, setReportData]);

  const onClickReportPrayCard = () => {
    analyticsTrack("클릭_기도카드_신고", {});
    setIsReportAlertOpen(true);
    return;
  };

  const onClickBlockUser = () => {
    analyticsTrack("클릭_프로필_차단", {});
    setIsConfirmAlertOpen(true);
    setAlertData({
      color: "bg-red-400",
      title: "유저 차단",
      description: "해당 유저를 차단하시겠습니까?",
      cancelText: "취소",
      actionText: "차단",
      onAction: async () => {
        if (!myMember?.user_id) return;
        const blockingUsers = myMember.profiles.blocking_users;
        await updateProfile(myMember.user_id, {
          blocking_users: [...blockingUsers, targetUserId],
        });
        window.location.reload();
      },
    });
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
          onClick={() => onClickReportPrayCard()}
        >
          <MdReportGmailerrorred />
          신고하기
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex justify-between  text-red-600"
          onClick={() => onClickBlockUser()}
        >
          <MdBlock />
          차단하기
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OtherPrayCardMenuBtn;
