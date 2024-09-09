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
const OtherPrayCardMenuBtn: React.FC = () => {
  const onClickReportPrayCard = () => {
    return;
  };
  const onClickBlockUser = () => {
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
