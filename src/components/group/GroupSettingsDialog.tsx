import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useBaseStore from "@/stores/baseStore";
import { Input } from "../ui/input";
import { Group } from "supabase/types/tables";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { analyticsTrack } from "@/analytics/analytics";
import { UserProfile } from "../profile/UserProfile";
import { Badge } from "../ui/badge";
import GroupMemberSettingsBtn from "./GroupMemberSettingsBtn";
import GroupMemberOptionTag from "./GroupMemberOptionTag";

interface GroupSettingsDialogProps {
  targetGroup: Group;
}

const GroupSettingsDialog: React.FC<GroupSettingsDialogProps> = ({
  targetGroup,
}) => {
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

  const onClickSaveGroup = async () => {
    if (inputGroupName.trim() === "") return;
    analyticsTrack("클릭_그룹_이름변경", { group_name: GroupSettingsDialog });
    const group = await updateGroup(targetGroup.id, { name: inputGroupName });
    if (group) {
      getGroup(targetGroup.id);
      setIsOpenGroupSettingsDialog(false);
    }
  };

  useEffect(() => {
    setGroupName(targetGroup.name || "");
  }, [setGroupName, targetGroup]);

  if (!memberList) return null;

  return (
    <Dialog
      open={isOpenGroupSettingsDialog}
      onOpenChange={setIsOpenGroupSettingsDialog}
    >
      <DialogContent className="w-11/12 rounded-xl">
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
          <section className="flex flex-col gap-4">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-700">
                그룹원 ({memberList.length})
              </label>
              <GroupMemberSettingsBtn />
            </div>
            <div className="flex flex-col gap-3 max-h-40 p-1 overflow-auto">
              {[...memberList]
                .sort((member) =>
                  member.user_id == targetGroup.user_id ? -1 : 1
                )
                .map((member) => (
                  <div key={member.id} className="flex justify-between">
                    <UserProfile
                      profile={member.profiles}
                      imgSize="w-7 h-7"
                      fontSize="font-midium"
                    />
                    {member.user_id === targetGroup.user_id ? (
                      <Badge>그룹장</Badge>
                    ) : (
                      <GroupMemberOptionTag member={member} />
                    )}
                  </div>
                ))}
            </div>
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
