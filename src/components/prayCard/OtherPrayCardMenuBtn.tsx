import React from "react";
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

const OtherPrayCardMenuBtn: React.FC = () => {
  const myMember = useBaseStore((state) => state.myMember);
  const otherMember = useBaseStore((state) => state.otherMember);
  const setIsReportAlertOpen = useBaseStore(
    (state) => state.setIsReportAlertOpen
  );
  const setIsConfirmAlertOpen = useBaseStore(
    (state) => state.setIsConfirmAlertOpen
  );
  const setAlertData = useBaseStore((state) => state.setAlertData);
  const updateProfile = useBaseStore((state) => state.updateProfile);

  const onClickReportPrayCard = () => {
    analyticsTrack("클릭_기도카드_신고", {});
    setIsReportAlertOpen(true);
    return;
  };
  const onClickBlockUser = () => {
    analyticsTrack("클릭_프로필_차단", {});
    setIsConfirmAlertOpen(true);
    setAlertData({
      title: "유저 차단",
      description: "해당 유저를 차단하시겠습니까?",
      cancelText: "취소",
      actionText: "차단",
      onAction: async () => {
        if (!myMember || !otherMember) return;
        const blockingUsers = myMember.profiles.blocking_users;
        const response = await updateProfile(myMember.user_id!, {
          blocking_users: [...blockingUsers, otherMember.user_id!],
        });
        console.log(response);
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
