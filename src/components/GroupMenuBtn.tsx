import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useToast } from "./ui/use-toast";
import menuIcon from "@/assets/menuIcon.svg";
import { Group } from "supabase/types/tables";
import { useNavigate } from "react-router-dom";
import useBaseStore from "@/stores/baseStore";

interface GroupManuBtnProps {
  userGroupList: Group[];
  targetGroup: Group | null;
}

const GroupManuBtn: React.FC<GroupManuBtnProps> = ({
  userGroupList,
  targetGroup,
}) => {
  const navigate = useNavigate();
  const maxGroupCount = Number(import.meta.env.VITE_MAX_GROUP_COUNT);
  const { toast } = useToast();
  const signOut = useBaseStore((state) => state.signOut);

  const handleClick = () => {
    if (userGroupList.length < maxGroupCount) {
      navigate("/group/new");
    } else {
      toast({
        description: `최대 ${maxGroupCount}개의 그룹만 참여할 수 있어요`,
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger className="flex flex-col items-end focus:outline-none">
        <img src={menuIcon} className="w-8 h-8" />
      </SheetTrigger>
      <SheetContent className="max-w-[288px] mx-auto w-[60%] px-5 py-16 flex flex-col items-end">
        <SheetHeader>
          <SheetTitle className="text-end">PrayU 그룹</SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 items-end text-gray-500">
          {userGroupList.map(
            (group) =>
              group && (
                <a
                  key={group.id}
                  href={`/group/${group.id}`}
                  className={`${
                    group.id === targetGroup?.id
                      ? "text-black font-bold underline"
                      : ""
                  }`}
                >
                  {group.name}
                </a>
              )
          )}
          <a className="cursor-pointer" onClick={() => handleClick()}>
            + 그룹 만들기
          </a>
          <hr />
          <a href="/">홈 화면</a>
          <a href={`${import.meta.env.VITE_PRAY_KAKAO_CHANNEL_CHAT_URL}`}>
            문의하기
          </a>
          <a className="cursor-pointer" onClick={() => signOut()}>
            로그아웃
          </a>
        </div>
        <SheetClose className="focus:outline-none"></SheetClose>
      </SheetContent>
    </Sheet>
  );
};

export default GroupManuBtn;
