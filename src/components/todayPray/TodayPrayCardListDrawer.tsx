import useBaseStore from "@/stores/baseStore";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import TodayPrayCardDummyList from "./TodayPrayCardDummyList";
import TodayPrayCardList from "./TodayPrayCardList";
import TodayPrayEmptyItem from "./TodayPrayEmptyItem";

const TodayPrayCardListDrawer: React.FC = () => {
  const memberList = useBaseStore((state) => state.memberList);
  const groupPrayCardList = useBaseStore((state) => state.groupPrayCardList);
  const isOpenTodayPrayDrawer = useBaseStore(
    (state) => state.isOpenTodayPrayDrawer
  );
  const setIsOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setIsOpenTodayPrayDrawer
  );

  if (!memberList || !groupPrayCardList) return null;

  return (
    <Drawer
      open={isOpenTodayPrayDrawer}
      onOpenChange={setIsOpenTodayPrayDrawer}
    >
      <DrawerContent className="bg-mainBg pb-5">
        <DrawerHeader className="pt-2">
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        {groupPrayCardList.length > 1 ? (
          <TodayPrayCardList />
        ) : memberList.length > 1 ? (
          <TodayPrayEmptyItem />
        ) : (
          <TodayPrayCardDummyList />
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default TodayPrayCardListDrawer;
