import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useBaseStore from "@/stores/baseStore";

const GroupAlert: React.FC = () => {
  const alertData = useBaseStore((state) => state.alertData);
  const isGroupAlertOpen = useBaseStore((state) => state.isGroupAlertOpen);
  const setIsGroupAlertOpen = useBaseStore(
    (state) => state.setIsGroupAlertOpen
  );

  return (
    <AlertDialog open={isGroupAlertOpen} onOpenChange={setIsGroupAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{alertData.title}</AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-wrap">
            {alertData.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{alertData.cancelText}</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500"
            onClick={() => alertData.onAction()}
          >
            {alertData.actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GroupAlert;
