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
  const memberList = useBaseStore((state) => state.memberList);
  const isGroupLeader = useBaseStore((state) => state.isGroupLeader);
  const setAlertData = useBaseStore((state) => state.setAlertData);
  const setIsConfirmAlertOpen = useBaseStore(
    (state) => state.setIsConfirmAlertOpen
  );
  const setActiveGroupMemberOption = useBaseStore(
    (state) => state.setActiveGroupMemberOption
  );
  const setIsOpenGroupSettingsDialog = useBaseStore(
    (state) => state.setIsOpenGroupSettingsDialog
  );
  const deleteMemberbyGroupId = useBaseStore(
    (state) => state.deleteMemberbyGroupId
  );
  const deletePrayCardByGroupId = useBaseStore(
    (state) => state.deletePrayCardByGroupId
  );

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

  const handleClickExitGroup = () => {
    if (!targetGroup || !user || !memberList) return;
    if (isGroupLeader && memberList.length !== 1) {
      setAlertData({
        color: "bg-blue-400",
        title: "그룹장 양도 필요",
        description:
          "그룹장은 그룹을 나갈 수 없어요\n 그룹장 양도를 먼저 진행해주세요!",
        actionText: "그룹 설정하기",
        cancelText: "취소",
        onAction: async () => {
          setIsConfirmAlertOpen(false);
          setActiveGroupMemberOption("assign");
          setIsOpenGroupSettingsDialog(true);
        },
      });
      setIsConfirmAlertOpen(true);
      return null;
    }
    setAlertData({
      color: "bg-red-400",
      title: "그룹 나가기",
      description: `더 이상 ${targetGroup.name}의 기도를 받을 수 없어요 😭`,
      actionText: "나가기",
      cancelText: "취소",
      onAction: async () => {
        await deleteMemberbyGroupId(user!.id, targetGroup.id);
        await deletePrayCardByGroupId(user!.id, targetGroup.id);
        window.location.replace("/");
        analyticsTrack("클릭_그룹_나가기", { group_id: targetGroup.id });
      },
    });
    setIsConfirmAlertOpen(true);
  };

  return (
    <Drawer
      open={isOpenGroupListDrawer}
      onOpenChange={setIsOpenGroupListDrawer}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col h-[60vh]">
          <div className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {groupList?.map((group) => (
                <li
                  key={group.id}
                  className="cursor-pointer p-3 hover:bg-gray-100 rounded-lg truncate flex justify-between items-center"
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

          <div className="p-4 border-t space-y-2">
            <button
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
              onClick={() => handleClickCreateGroup()}
            >
              새 그룹 만들기
            </button>
            {targetGroup && !isGroupListPage && (
              <button
                className="w-full py-3 text-red-500 rounded-lg font-medium hover:bg-gray-100"
                onClick={() => handleClickExitGroup()}
              >
                그룹 나가기
              </button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
