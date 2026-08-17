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
import { useToast } from "../ui/use-toast";
import { Check, Plus } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { UserPlanType } from "@/Enums/userPlanType";

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
      userPlan === UserPlanType.Premium
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
      <DrawerContent className="mx-auto max-w-app">
        <div className="px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-1">
          <DrawerHeader className="p-0 pb-3.5 text-left">
            <DrawerTitle className="text-[17px] font-bold tracking-tight text-black">
              내 그룹
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              이동할 그룹을 선택하세요
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex max-h-[55vh] flex-col gap-2.5 overflow-y-auto">
            {!groupList
              ? [...Array(3)].map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-[4.25rem] w-full rounded-[1.25rem] bg-gray-200"
                  />
                ))
              : groupList.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => handleClickGroup(group)}
                    className="flex items-center rounded-[1.25rem] border border-black/[0.04] bg-white px-5 py-4 text-left shadow-sm transition-all duration-150 active:scale-[0.98] active:shadow-none"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-base font-bold text-black">
                        {group?.name}
                      </span>
                      <span
                        className={`mt-0.5 text-[13px] ${
                          group.user_id === user?.id
                            ? "text-accentFrom"
                            : "text-dark"
                        }`}
                      >
                        {group.user_id === user?.id ? "그룹장" : "그룹원"}
                      </span>
                    </span>
                    {targetGroup?.id === group.id && !isGroupListPage && (
                      <Check
                        size={20}
                        strokeWidth={2.6}
                        className="ml-auto shrink-0 text-accentFrom"
                      />
                    )}
                  </button>
                ))}
            <button
              type="button"
              onClick={handleClickCreateGroup}
              className="flex items-center justify-center gap-1.5 rounded-[1.25rem] border border-dashed border-accentFrom/40 bg-white/50 px-5 py-4 font-semibold text-accentFrom transition-all duration-150 active:scale-[0.98]"
            >
              <Plus size={18} strokeWidth={2.4} />새 그룹 만들기
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
