import { analyticsTrack } from "@/analytics/analytics";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RiMoreFill } from "react-icons/ri";
import { AiOutlineCrown } from "react-icons/ai";
import { IoMdExit } from "react-icons/io";
import useBaseStore from "@/stores/baseStore";

const GroupMemberSettingsBtn = () => {
  const setActiveGroupMemberOption = useBaseStore(
    (state) => state.setActiveGroupMemberOption
  );

  const onClickDeleteMemberInGroup = () => {
    analyticsTrack("클릭_그룹_내보내기옵션", {});
    setActiveGroupMemberOption("delete");
  };

  const onClickAssignGroupLeader = () => {
    analyticsTrack("클릭_그룹_그룹장양도옵션", {});
    setActiveGroupMemberOption("assign");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={() => {
          analyticsTrack("클릭_그룹_멤버설정", {});
        }}
      >
        <RiMoreFill className="text-2xl" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="flex justify-between"
          onClick={() => onClickAssignGroupLeader()}
        >
          <AiOutlineCrown />
          그룹양도
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex justify-between"
          onClick={() => onClickDeleteMemberInGroup()}
        >
          <IoMdExit />
          내보내기
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default GroupMemberSettingsBtn;
