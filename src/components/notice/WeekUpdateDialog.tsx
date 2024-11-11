import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useBaseStore from "@/stores/baseStore";
import { Badge } from "../ui/badge";

const WeekUpdateDialog = () => {
  const isOpenWeekUpdateDialog = useBaseStore(
    (state) => state.isOpenWeekUpdateDialog
  );
  const setIsOpenWeekUpdateDialog = useBaseStore(
    (state) => state.setIsOpenWeekUpdateDialog
  );

  return (
    <Dialog
      open={isOpenWeekUpdateDialog}
      onOpenChange={setIsOpenWeekUpdateDialog}
    >
      <DialogContent className="w-11/12 h-96 overflow-auto rounded-2xl bg-mainBg">
        <DialogHeader>
          <DialogTitle className="text-xl text-left">
            기도카드 주기 변경 안내
          </DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="w-full flex flex-col gap-1 py-3 items-left">
            {/* <span className="text-xs text-left pl-3">이전</span> */}
            <div className="flex items-start pl-2">
              <Badge className="text-xs">이전</Badge>
            </div>
            <div className="border border-gray-300 rounded-md block p-2">
              <img
                src="/images/beforeWeek.png"
                alt="beforeWeek"
                className="rounded-md"
              />
            </div>

            <div className="flex items-start pl-2">
              <Badge className="text-xs">이후</Badge>
            </div>
            <div className="border border-gray-300 rounded-md block p-2">
              <img
                src="/images/afterWeek.png"
                alt="afterWeek"
                className="rounded-md"
              />
            </div>

            <div className="flex flex-col items-start mt-3">
              <p className="text-sm text-left text-gray-400 pt-1">
                기존에는 작성일로부터 일주일 동안 노출됐는데, 이제는 작성 날짜에
                상관없이 해당 주차까지만 보여드려요:)
              </p>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default WeekUpdateDialog;
