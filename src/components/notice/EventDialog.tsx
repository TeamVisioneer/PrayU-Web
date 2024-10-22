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
      <DialogContent className="w-11/12 h-96 overflow-auto rounded-2xl bg-mainBg">
        <DialogHeader>
          <DialogTitle className="text-xl text-left">
            [2024.10.22] 업데이트 안내
          </DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="w-full flex flex-col gap-2 py-3">
            <div className="flex flex-col items-start gap-1">
              <h1 className="text-xl">☑️ 내 기도제목 기도</h1>
              <p className="text-sm text-left text-gray-400">
                오늘의 기도에서 내 기도제목을 확인하고 기도할 수 있어요! 내
                기도제목을 위해서도 매일 기도해주세요:)
              </p>
            </div>
            <div className="flex flex-col items-start gap-1">
              <h1 className="text-xl">☑️ 알림 기능 추가</h1>
              <p className="text-sm text-left text-gray-400">
                그룹원 입장, 기도제목 작성, 오늘의 기도 리마인드 등을 위한
                알림기능이 추가되었어요!
              </p>
            </div>
            <div className="flex flex-col items-start gap-1">
              <h1 className="text-xl">☑️ 튜토리얼 추가</h1>
              <p className="text-sm text-left text-gray-400">
                그룹 가입 후 튜토리얼을 통해 서비스 사용 방법을 확인할 수
                있어요! 기존 유저들은 메뉴탭에서 튜토리얼을 확인할 수 있습니다:)
              </p>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;
