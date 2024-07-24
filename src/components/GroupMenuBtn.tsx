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
import menuIcon from "@/assets/menuIcon.png";
import { Group } from "supabase/types/tables";
import useBaseStore from "@/stores/baseStore";

interface GroupManuBtnProps {
  userGroupList: Group[];
  targetGroup: Group | null;
}

const GroupManuBtn: React.FC<GroupManuBtnProps> = ({
  userGroupList,
  targetGroup,
}) => {
  const currentGroupCount = useBaseStore((state) => state.currentGroupCount);
  const maxPossibleGroupCount = useBaseStore(
    (state) => state.maxPossibleGroupCount
  );
  const { toast } = useToast();
  return (
    <Sheet>
      <SheetTrigger className="flex flex-col items-end focus:outline-none">
        <img src={menuIcon} alt="asdf" className="w-8 h-8" />
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
                  href={`${import.meta.env.VITE_BASE_URL}/group/${group.id}`}
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
          {currentGroupCount < maxPossibleGroupCount ? (
            <a href={`${import.meta.env.VITE_BASE_URL}/group/new`}>
              + 그룹 만들기
            </a>
          ) : (
            <button
              onClick={() => {
                toast({
                  description: `그룹은 최대 ${maxPossibleGroupCount}개까지 만들 수 있어요`,
                });
              }}
            >
              + 그룹 만들기
            </button>
          )}
          <a href={`${import.meta.env.VITE_PRAY_KAKAO_CHANNEL_CHAT_URL}`}>
            문의하기
          </a>
        </div>
        <SheetClose className="focus:outline-none">Close</SheetClose>
      </SheetContent>
    </Sheet>
  );
};

export default GroupManuBtn;
