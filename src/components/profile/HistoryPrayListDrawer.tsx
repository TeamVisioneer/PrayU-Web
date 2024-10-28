import HistoryPrayList from "@/components/profile/HistoryPrayList";
import useBaseStore from "@/stores/baseStore";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

const HistoryPrayDrawer: React.FC = () => {
  const isOpenMyPrayDrawer = useBaseStore((state) => state.isOpenMyPrayDrawer);
  const setIsOpenMyPrayDrawer = useBaseStore(
    (state) => state.setIsOpenMyPrayDrawer
  );

  return (
    <Drawer open={isOpenMyPrayDrawer} onOpenChange={setIsOpenMyPrayDrawer}>
      <DrawerContent className="h-[400px] bg-mainBg">
        <DrawerHeader>
          <DrawerTitle className="p-4 text-center">기도해 준 친구</DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <HistoryPrayList />
      </DrawerContent>
    </Drawer>
  );
};

export default HistoryPrayDrawer;
