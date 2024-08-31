import useBaseStore from "@/stores/baseStore";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { KakaoShareButton } from "./KakaoShareBtn";
import { getISOTodayDateYMD } from "@/lib/utils";

const ContentDrawer = () => {
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const isOpenContentDrawer = useBaseStore(
    (state) => state.isOpenContentDrawer
  );
  const setIsOpenContentDrawer = useBaseStore(
    (state) => state.setIsOpenContentDrawer
  );
  const today = getISOTodayDateYMD();
  const contentNumber = parseInt(today.day, 10) % 10;

  const DrawerBody = (
    <div className="flex flex-col items-center gap-6 pb-10">
      <div className="flex flex-col items-center gap-2">
        <p className="text-xl font-bold">오늘의 말씀이 도착했어요 🎁</p>
        <p className="text-sm text-gray-500">
          오늘의 기도를 한 분들에게만 도착해요 :)
        </p>
      </div>

      <div className="h-[300px] flex flex-col items-center">
        <img
          className="h-full rounded-md"
          src={`https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/BibleContent/content${contentNumber}.png`}
        />
      </div>
      <KakaoShareButton
        targetGroup={targetGroup}
        message="카카오톡으로 공유하기"
        eventOption={{ where: "ContentDrawer" }}
        type="bible"
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
