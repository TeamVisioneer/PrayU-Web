import useBaseStore from "@/stores/baseStore";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { getDomainUrl } from "@/lib/utils";
import { KakaoShareButton } from "./KakaoShareBtn";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import KakaoShareImageUrl from "/images/KakaoShare.png";
import { analyticsTrack } from "@/analytics/analytics";

const ShareDrawer: React.FC = () => {
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const isOpenShareDrawer = useBaseStore((state) => state.isOpenShareDrawer);
  const setIsOpenShareDrawer = useBaseStore(
    (state) => state.setIsOpenShareDrawer
  );
  const domainUrl = getDomainUrl();

  const onClickCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        toast({
          description: "🔗 그룹 링크가 복사되었어요",
        });
      })
      .catch((err) => {
        console.error("복사하는 중 오류가 발생했습니다: ", err);
      });
    analyticsTrack("클릭_공유_링크복사", {});
  };

  const DrawerBody = (
    <div className="h-[80vh] flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <p className="text-lg font-bold">그룹원들과 함께 기도할 수 있어요!</p>
        <p className="text-gray-500"> 새 그룹원들을 초대해 보아요 📮</p>
      </div>

      <div className="h-[300px] flex flex-col items-center">
        <img className="h-full rounded-md" src={KakaoShareImageUrl} />
      </div>
      <div className="flex flex-col gap-2">
        <KakaoShareButton
          groupPageUrl={`${domainUrl}/group/${targetGroup?.id}`}
          id="groupPage"
          message="카카오톡으로 초대하기"
          eventOption={{ where: "GroupPage" }}
        />
        <Button
          className="px-10 py-2 rounded-md"
          onClick={() => onClickCopyLink()}
        >
          그룹 링크 복사하기
        </Button>
      </div>
    </div>
  );

  return (
    <Drawer open={isOpenShareDrawer} onOpenChange={setIsOpenShareDrawer}>
      <DrawerContent className="bg-mainBg focus:outline-none">
        <DrawerHeader className="p-2">
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        {DrawerBody}
      </DrawerContent>
    </Drawer>
  );
};

export default ShareDrawer;
