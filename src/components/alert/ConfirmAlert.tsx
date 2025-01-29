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

const ConfirmAlert: React.FC = () => {
  const alertData = useBaseStore((state) => state.alertData);
  const isConfirmAlertOpen = useBaseStore((state) => state.isConfirmAlertOpen);
  const setIsConfirmAlertOpen = useBaseStore(
    (state) => state.setIsConfirmAlertOpen
  );

  return (
    <AlertDialog open={isConfirmAlertOpen} onOpenChange={setIsConfirmAlertOpen}>
      <AlertDialogContent className="w-11/12 rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{alertData.title}</AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-wrap">
            {alertData.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col items-center">
          <AlertDialogAction
            className={`w-3/4 ${alertData.color}`}
            onClick={() => alertData.onAction()}
          >
            {alertData.actionText}
          </AlertDialogAction>
          {alertData.cancelText && (
            <AlertDialogCancel className="w-3/4">
              {alertData.cancelText}
            </AlertDialogCancel>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmAlert;
