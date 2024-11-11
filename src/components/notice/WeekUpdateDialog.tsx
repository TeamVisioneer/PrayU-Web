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
      <DialogContent className="w-11/12 h-auto overflow-auto rounded-2xl bg-mainBg">
        <DialogHeader>
          <DialogTitle className="text-xl text-left">
            기도제목 주기 변경 안내
          </DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="w-full flex flex-col gap-1 py-3 items-left">
            <div className="flex items-start pl-2">
              <Badge className="text-xs">이전</Badge>
            </div>
            <div className="flex flex-col items-center border border-gray-300 rounded-md p-2">
              <img
                src="/images/beforeWeek.png"
                alt="beforeWeek"
                className="h-14 rounded-md"
              />
            </div>

            <div className="flex items-start pl-2">
              <Badge className="text-xs">이후</Badge>
            </div>
            <div className="flex flex-col items-center border border-gray-300 rounded-md p-2">
              <img
                src="/images/afterWeek.png"
                alt="afterWeek"
                className="h-14 rounded-md"
              />
            </div>

            <div className="flex flex-col items-start mt-3">
              <p className="text-sm text-left text-gray-400 pt-1">
                기존에는 기도제목을 어느 요일에도 작성할 수 있었는데, 이제부턴
                일요일에만 기도제목을 작성할 수 있어요:)
              </p>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default WeekUpdateDialog;
