import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import menuIcon from "@/assets/menuIcon.png";
import { Group } from "supabase/types/tables";

interface GroupManuBtnProps {
  userGroupList: Group[];
  targetGroup: Group | null;
}

const GroupManuBtn: React.FC<GroupManuBtnProps> = ({
  userGroupList,
  targetGroup,
}) => {
  return (
    <Sheet>
      <SheetTrigger className="flex flex-col items-end">
        <img src={menuIcon} alt="asdf" className="w-8 h-8" />
      </SheetTrigger>
      <SheetContent className="max-w-[288px] mx-auto w-[60%] px-5 py-16 flex flex-col items-end">
        <SheetHeader>
          <SheetTitle className="text-end">PrayU 그룹</SheetTitle>
          <SheetClose className="focus:outline-none">
            <div className="flex flex-col gap-4 items-end text-gray-500">
              {userGroupList.map((group) => (
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
              ))}
              <a href={"/group/new"}>+ 그룹 만들기</a>
              <a href={`${import.meta.env.VITE_PRAY_KAKAO_CHANNEL_CHAT_URL}`}>
                문의하기
              </a>
            </div>
          </SheetClose>
          <SheetDescription></SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default GroupManuBtn;
