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

interface DefaultAlertProps {
  title: string;
  description: string[];
  cancelText: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const DefaultAlert: React.FC<DefaultAlertProps> = ({
  title,
  description,
  cancelText,
  confirmText,
  onCancel,
  onConfirm,
}) => {
  const isDefaultAlertOpen = useBaseStore((state) => state.isDefaultAlertOpen);
  const setIsDefaultAlertOpen = useBaseStore(
    (state) => state.setIsDefaultAlertOpen
  );

  return (
    <AlertDialog open={isDefaultAlertOpen} onOpenChange={setIsDefaultAlertOpen}>
      <AlertDialogContent className="w-5/6">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>

          <AlertDialogDescription>
            {description.map((desc) => desc)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onCancel()}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction className="bg-mainBtn" onClick={() => onConfirm()}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DefaultAlert;
