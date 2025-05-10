import { Group } from "supabase/types/tables";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import useBaseStore from "@/stores/baseStore";
import { analyticsTrack } from "@/analytics/analytics";
import { FaCircleCheck } from "react-icons/fa6";
import { useToast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
export default function GroupListDrawer() {
  const user = useBaseStore((state) => state.user);
  const groupList = useBaseStore((state) => state.groupList);
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const isOpenGroupListDrawer = useBaseStore(
    (state) => state.isOpenGroupListDrawer
  );
  const setIsOpenGroupListDrawer = useBaseStore(
    (state) => state.setIsOpenGroupListDrawer
  );
  const maxGroupCount = Number(import.meta.env.VITE_MAX_GROUP_COUNT);
  const userPlan = useBaseStore((state) => state.userPlan);
  const { toast } = useToast();

  const isGroupListPage = window.location.pathname === "/group";

  const handleClickGroup = (group: Group) => {
    setIsOpenGroupListDrawer(false);
    analyticsTrack("클릭_그룹_전환", { group_id: group.id });
    window.location.href = `/group/${group.id}`;
  };

  const handleClickCreateGroup = () => {
    if (
      (groupList?.length && groupList?.length < maxGroupCount) ||
      userPlan === "Premium"
    ) {
      window.location.href = "/group/new";
      analyticsTrack("클릭_그룹_추가", { group_length: groupList?.length });
    } else {
      toast({
        description: `최대 ${maxGroupCount}개의 그룹만 참여할 수 있어요`,
      });
    }
  };

  return (
    <Drawer
      open={isOpenGroupListDrawer}
      onOpenChange={(open) => {
        setIsOpenGroupListDrawer(open);
        if (!open && window.history.state?.open === true) window.history.back();
      }}
    >
      <DrawerContent className="bg-mainBg h-[60vh]">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto p-4">
          <ul className="space-y-2 overflow-y-auto">
            {!groupList
              ? [...Array(3)].map((_, index) => (
                  <div className="flex items-center gap-3 py-3" key={index}>
                    <Skeleton className="w-10 h-10 bg-gray-200 rounded-lg" />
                    <div>
                      <Skeleton className="w-24 h-5 bg-gray-200 mb-1" />
                      <Skeleton className="w-16 h-4 bg-gray-200" />
                    </div>
                  </div>
                ))
              : groupList.map((group) => (
                  <li
                    key={group.id}
                    className="cursor-pointer p-3 rounded-lg truncate flex justify-between items-center"
                    onClick={() => handleClickGroup(group)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        {group?.name ? [...group.name][0] : ""}
                      </div>
                      <div>
                        <div className="font-medium">{group?.name}</div>
                        {group.user_id === user?.id ? (
                          <div className="text-sm text-mainBtn">그룹장</div>
                        ) : (
                          <div className="text-sm text-gray-500">그룹원</div>
                        )}
                      </div>
                    </div>
                    {targetGroup?.id === group.id && !isGroupListPage && (
                      <span className="text-blue-500">
                        <FaCircleCheck size={20} />
                      </span>
                    )}
                  </li>
                ))}
          </ul>
        </div>

        {/* 플로팅 버튼 */}
        <Button
          variant="primary"
          onClick={handleClickCreateGroup}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center p-0 z-10"
          aria-label="새 그룹 만들기"
        >
          <PlusCircle className="h-6 w-6" />
        </Button>
      </DrawerContent>
    </Drawer>
  );
}
