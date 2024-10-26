import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useBaseStore from "@/stores/baseStore";
import HookingItem from "./HookingItem";

const GroupSettingsDialog: React.FC = () => {
  const isOpenHookingDialog = useBaseStore(
    (state) => state.isOpenHookingDialog
  );
  const setIsOpenHookingDialog = useBaseStore(
    (state) => state.setIsOpenHookingDialog
  );

  return (
    <Dialog open={isOpenHookingDialog} onOpenChange={setIsOpenHookingDialog}>
      <DialogContent className="w-11/12 rounded-xl">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <HookingItem />
      </DialogContent>
    </Dialog>
  );
};

export default GroupSettingsDialog;
