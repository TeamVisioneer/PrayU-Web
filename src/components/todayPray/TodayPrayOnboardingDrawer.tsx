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
  const isPrayToday = useBaseStore((state) => state.isPrayToday);

  return (
    <Drawer
      open={isOpenOnboardingDrawer}
      onOpenChange={setIsOpenOnboardingDrawer}
    >
      <DrawerContent className="bg-mainBg pb-5">
        <DrawerHeader className="p-2">
          <DrawerTitle></DrawerTitle>
          <DrawerDescription className="text-sm text-center text-gray-400">
            {isPrayToday ? <br /> : "반응을 누르면 다음 기도로 넘어가요"}
          </DrawerDescription>
        </DrawerHeader>
        <TodayPrayCardOnboardingList />
      </DrawerContent>
    </Drawer>
  );
};

export default TodayPrayOnboardingDrawer;
