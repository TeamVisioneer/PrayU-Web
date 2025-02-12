import { Group } from "supabase/types/tables";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import useBaseStore from "@/stores/baseStore";
import { analyticsTrack } from "@/analytics/analytics";

export default function GroupListDrawer() {
  const groupList = useBaseStore((state) => state.groupList);
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const isOpenGroupListDrawer = useBaseStore(
    (state) => state.isOpenGroupListDrawer
  );
  const setIsOpenGroupListDrawer = useBaseStore(
    (state) => state.setIsOpenGroupListDrawer
  );

  const handleClickGroup = (group: Group) => {
    setIsOpenGroupListDrawer(false);
    analyticsTrack("클릭_그룹_전환", { group_id: group.id });
    window.location.href = `/group/${group.id}`;
  };

  return (
    <Drawer
      open={isOpenGroupListDrawer}
      onOpenChange={setIsOpenGroupListDrawer}
    >
      <DrawerContent>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">참여 그룹 목록</h2>
          <ul>
            {groupList?.map((group) => (
              <li
                key={group.id}
                className="cursor-pointer p-2 hover:bg-gray-100 truncate flex justify-between items-center"
                onClick={() => handleClickGroup(group)}
              >
                <span>{group.name}</span>
                {targetGroup?.id === group.id && (
                  <span className="text-green-500 font-bold text-lg ml-2">
                    ✓
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
