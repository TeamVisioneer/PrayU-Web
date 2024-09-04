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
import { RiDeleteBin6Line } from "react-icons/ri";
import { analyticsTrack } from "@/analytics/analytics";

interface MyMoreBtnProps {
  handleEditClick: () => void;
  onClickCopyPrayCard: () => void;
  onClickDeletePrayCard: () => void;
}

const MyPrayCardMoreBtn: React.FC<MyMoreBtnProps> = ({
  handleEditClick,
  onClickCopyPrayCard,
  onClickDeletePrayCard,
}) => {
  return (
    <>
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
            className="flex justify-between text-red-600"
            onClick={() => onClickDeletePrayCard()}
          >
            <RiDeleteBin6Line />
            삭제하기
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default MyPrayCardMoreBtn;
