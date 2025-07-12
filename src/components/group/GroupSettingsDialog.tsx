import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useBaseStore from "@/stores/baseStore";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { analyticsTrack } from "@/analytics/analytics";
import GroupMemberSettingsBtn from "./GroupMemberSettingsBtn";
import GroupMemberProfileList from "./GroupMemberProfileList";
import WheelPicker from "../ui/wheel-picker";

const GroupSettingsDialog: React.FC = () => {
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const isOpenGroupSettingsDialog = useBaseStore(
    (state) => state.isOpenGroupSettingsDialog
  );
  const setIsOpenGroupSettingsDialog = useBaseStore(
    (state) => state.setIsOpenGroupSettingsDialog
  );
  const inputGroupName = useBaseStore((state) => state.inputGroupName);
  const setGroupName = useBaseStore((state) => state.setGroupName);
  const updateGroup = useBaseStore((state) => state.updateGroup);
  const memberList = useBaseStore((state) => state.memberList);
  const getGroup = useBaseStore((state) => state.getGroup);

  // 선택된 시간을 추적하는 상태
  const [selectedHour, setSelectedHour] = useState(0);

  const onClickSaveGroup = async () => {
    if (!targetGroup) return;
    if (inputGroupName.trim() === "") return;
    analyticsTrack("클릭_그룹_이름변경", { group_name: GroupSettingsDialog });
    const group = await updateGroup(targetGroup.id, {
      name: inputGroupName,
      pray_time: `${selectedHour.toString().padStart(2, "0")}:00`,
    });
    if (group) {
      getGroup(targetGroup.id);
      setIsOpenGroupSettingsDialog(false);
    }
  };

  useEffect(() => {
    setGroupName(targetGroup?.name || "");
    if (targetGroup?.pray_time) {
      const hour = parseInt(targetGroup.pray_time.split(":")[0], 10);
      setSelectedHour(isNaN(hour) ? 0 : hour);
    }
  }, [setGroupName, targetGroup, setSelectedHour, isOpenGroupSettingsDialog]);

  if (!memberList || !targetGroup) return null;

  return (
    <Dialog
      open={isOpenGroupSettingsDialog}
      onOpenChange={setIsOpenGroupSettingsDialog}
    >
      <DialogContent
        className="w-11/12 rounded-xl max-h-90vh overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>그룹 설정</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-8 p-4">
          <section className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">그룹명</label>
            <Input
              type="text"
              value={inputGroupName}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={12}
            />
          </section>

          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                그룹 기도시간
              </label>
              <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                BETA
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-gray-500 mt-1">
                지정된 시간에 그룹원들에게 기도 알림을 전송해 보아요.
              </p>
              <p className="text-xs text-gray-500">
                베타 기능으로 알림이 정확하지 않을 수 있습니다.
              </p>
            </div>

            <WheelPicker
              selectedHour={selectedHour}
              onChange={setSelectedHour}
            />
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-700">
                그룹원 ({memberList.length})
              </label>
              <GroupMemberSettingsBtn />
            </div>
            <GroupMemberProfileList
              memberList={memberList}
              targetGroup={targetGroup}
            />
          </section>
          <footer className="flex gap-2 justify-center">
            <Button
              variant="secondary"
              className="w-20"
              onClick={() => setIsOpenGroupSettingsDialog(false)}
            >
              취소
            </Button>
            <Button
              variant="primary"
              className="w-20"
              onClick={() => onClickSaveGroup()}
            >
              확인
            </Button>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupSettingsDialog;
