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
import useBaseStore from "@/stores/baseStore";
import { toast } from "../ui/use-toast";

interface MyMoreBtnProps {
  handleEditClick: () => void;
}

const MyPrayCardMenuBtn: React.FC<MyMoreBtnProps> = ({ handleEditClick }) => {
  const inputPrayCardContent = useBaseStore(
    (state) => state.inputPrayCardContent
  );
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

  const onClickDeletePrayCard = () => {
    toast({
      description: "아직 개발중이에요 👀",
    });
    analyticsTrack("클릭_기도카드_삭제", {});
    return;
  };
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

export default MyPrayCardMenuBtn;
