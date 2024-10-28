import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import useBaseStore from "@/stores/baseStore";
import PrayCardHistoryUI from "./PrayCardHistoryUI";

const PrayCardHistoryDrawer: React.FC = () => {
  const isOpenHistoryDrawer = useBaseStore(
    (state) => state.isOpenHistoryDrawer
  );
  const setIsOpenHistoryDrawer = useBaseStore(
    (state) => state.setIsOpenHistoryDrawer
  );

  return (
    <Drawer open={isOpenHistoryDrawer} onOpenChange={setIsOpenHistoryDrawer}>
      <DrawerContent className="bg-mainBg pb-5">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <PrayCardHistoryUI />
      </DrawerContent>
    </Drawer>
  );
};

export default PrayCardHistoryDrawer;
