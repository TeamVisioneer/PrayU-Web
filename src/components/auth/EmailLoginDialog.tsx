import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "../../../supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import useBaseStore from "@/stores/baseStore";

const EmailLoginDialog = () => {
  const isEmailLoginDialogOpen = useBaseStore(
    (state) => state.isEmailLoginDialogOpen
  );
  const setIsEmailLoginDialogOpen = useBaseStore(
    (state) => state.setIsEmailLoginDialogOpen
  );

  return (
    <Dialog
      open={isEmailLoginDialogOpen}
      onOpenChange={setIsEmailLoginDialogOpen}
    >
      <DialogContent className="w-11/12 rounded-xl flex-col items-start">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EmailLoginDialog;
