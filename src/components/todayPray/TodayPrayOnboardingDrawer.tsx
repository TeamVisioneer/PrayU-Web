import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import useBaseStore from "@/stores/baseStore";
import TodayPrayCardOnboardingList from "./TodayPrayOnboardingList";

const TodayPrayOnboardingDrawer = () => {
  const isOpenOnboardingDrawer = useBaseStore(
    (state) => state.isOpenOnboardingDrawer
  );
  const setIsOpenOnboardingDrawer = useBaseStore(
    (state) => state.setIsOpenOnboardingDrawer
  );

  return (
    <Drawer
      open={isOpenOnboardingDrawer}
      onOpenChange={setIsOpenOnboardingDrawer}
    >
      <DrawerContent className="bg-mainBg pb-5">
        <DrawerHeader className="p-2">
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <TodayPrayCardOnboardingList />
      </DrawerContent>
    </Drawer>
  );
};

export default TodayPrayOnboardingDrawer;
