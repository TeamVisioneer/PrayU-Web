import PrayList from "./PrayList";
import useBaseStore from "@/stores/baseStore";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

const PrayListDrawer: React.FC = () => {
  const isOpenMyPrayDrawer = useBaseStore((state) => state.isOpenMyPrayDrawer);
  const setIsOpenMyPrayDrawer = useBaseStore(
    (state) => state.setIsOpenMyPrayDrawer
  );

  return (
    <Drawer
      open={isOpenMyPrayDrawer}
      onOpenChange={(open) => {
        setIsOpenMyPrayDrawer(open);
        if (!open && window.history.state?.open === true) window.history.back();
      }}
    >
      <DrawerContent className="h-[400px] bg-mainBg">
        <DrawerHeader>
          <DrawerTitle className="p-4 text-center">기도해 준 친구</DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <PrayList />
      </DrawerContent>
    </Drawer>
  );
};

export default PrayListDrawer;
