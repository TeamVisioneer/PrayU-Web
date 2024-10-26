import useBaseStore from "@/stores/baseStore";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import TodayPrayCardList from "./TodayPrayCardList";

const TodayPrayCardListDrawer: React.FC = () => {
  const isOpenTodayPrayDrawer = useBaseStore(
    (state) => state.isOpenTodayPrayDrawer
  );
  const setIsOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setIsOpenTodayPrayDrawer
  );
  const setIsOpenHookingDialog = useBaseStore(
    (state) => state.setIsOpenHookingDialog
  );

  const handleOnCloseTodayPrayDrawer = () => {
    setIsOpenHookingDialog(true);
  };

  return (
    <Drawer
      open={isOpenTodayPrayDrawer}
      onClose={() => handleOnCloseTodayPrayDrawer()}
      onOpenChange={setIsOpenTodayPrayDrawer}
    >
      <DrawerContent className="bg-mainBg pb-5">
        <DrawerHeader className="pt-2">
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <TodayPrayCardList />
      </DrawerContent>
    </Drawer>
  );
};

export default TodayPrayCardListDrawer;
