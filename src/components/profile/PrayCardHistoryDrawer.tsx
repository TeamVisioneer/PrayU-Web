import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import useBaseStore from "@/stores/baseStore";
import MyPrayCardUI from "../prayCard/MyPrayCardUI";
import PrayListBtn from "../pray/PrayListBtn";

const PrayCardHistoryDrawer: React.FC = () => {
  const isOpenHistoryDrawer = useBaseStore(
    (state) => state.isOpenHistoryDrawer
  );
  const setIsOpenHistoryDrawer = useBaseStore(
    (state) => state.setIsOpenHistoryDrawer
  );
  const historyCard = useBaseStore((state) => state.historyCard);
  return (
    <Drawer
      open={isOpenHistoryDrawer}
      onOpenChange={setIsOpenHistoryDrawer}
      onClose={() => {
        if (window.history.state?.open === true) {
          window.history.back();
        }
      }}
    >
      <DrawerContent className="bg-mainBg">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col min-h-80vh max-h-80vh gap-2 px-10 pt-5 pb-10">
          <MyPrayCardUI prayCard={historyCard} />
          <PrayListBtn prayDatas={historyCard?.pray} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PrayCardHistoryDrawer;
