import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useBaseStore from "@/stores/baseStore";

const EventDialog = () => {
  const isOpenEventDialog = useBaseStore((state) => state.isOpenEventDialog);
  const setIsOpenEventDialog = useBaseStore(
    (state) => state.setIsOpenEventDialog
  );
  return (
    <Dialog open={isOpenEventDialog} onOpenChange={setIsOpenEventDialog}>
      <DialogContent className="w-full aspect-[1/1]">
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;
