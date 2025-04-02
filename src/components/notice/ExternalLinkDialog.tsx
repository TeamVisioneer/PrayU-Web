import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import useBaseStore from "@/stores/baseStore";

const ExternalLinkDialog: React.FC = () => {
  const externalUrl = useBaseStore((state) => state.externalUrl);
  const setExternalUrl = useBaseStore((state) => state.setExternalUrl);

  return (
    <Dialog
      open={!!externalUrl}
      onOpenChange={(open) => {
        if (!open) {
          setExternalUrl(null);
          if (window.history.state?.open === true) window.history.back();
        }
      }}
    >
      <DialogContent
        className="w-11/12 h-[70vh] p-0 flex flex-col rounded-lg"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {externalUrl && (
            <iframe
              src={externalUrl}
              className="w-full h-full border-0 rounded-lg"
              title="External content"
            />
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExternalUrl(null)}
          className="rounded-full absolute left-1/2 -translate-x-1/2 -bottom-14 bg-white shadow-md z-10"
        >
          <X className="h-6 w-6" />
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ExternalLinkDialog;
