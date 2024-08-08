import useBaseStore from "@/stores/baseStore";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { KakaoShareButton } from "./KakaoShareBtn";
import { getDomainUrl } from "@/lib/utils";

const ContentDrawer = () => {
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const isOpenContentDrawer = useBaseStore(
    (state) => state.isOpenContentDrawer
  );
  const setIsOpenContentDrawer = useBaseStore(
    (state) => state.setIsOpenContentDrawer
  );
  const domainUrl = getDomainUrl();

  const DrawerBody = (
    <div className="h-[80vh] flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <p className="text-xl font-bold">오늘의 말씀이 도착했어요 🎁</p>
        <p className="text-md text-gray-500"> 구성원들에게 공유해봐요 :)</p>
      </div>

      <div className="h-[300px] flex flex-col items-center">
        <img
          className="h-full rounded-md"
          src={
            "https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/BibleContent/20240808.svg"
          }
        />
      </div>
      <KakaoShareButton
        groupPageUrl={`${domainUrl}/group/${targetGroup?.id}`}
        id="ContentDrawer"
        message="카카오톡으로 공유하기"
        eventOption={{ where: "ContentDrawer" }}
      />
    </div>
  );

  return (
    <Drawer open={isOpenContentDrawer} onOpenChange={setIsOpenContentDrawer}>
      <DrawerContent className="bg-mainBg focus:outline-none">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        {DrawerBody}
      </DrawerContent>
    </Drawer>
  );
};

export default ContentDrawer;
