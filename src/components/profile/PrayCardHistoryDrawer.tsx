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
      onOpenChange={(open) => {
        setIsOpenHistoryDrawer(open);
        if (!open && window.history.state?.open === true) window.history.back();
      }}
    >
      <DrawerContent className="bg-mainBg">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        {historyCard?.bible_card_url ? (
          <div className="flex flex-col min-h-80vh max-h-80vh gap-2 px-10 pt-5 pb-10 overflow-auto">
            <div className="flex-shrink-0 rounded-xl overflow-hidden shadow-md">
              <img
                src={historyCard.bible_card_url}
                className="w-full object-cover rounded-xl"
                alt="기도카드 이미지"
              />
            </div>
            <div className="flex flex-col gap-3 bg-white/5 p-4 rounded-lg">
              <h3 className="text-base font-semibold text-primary">
                기도카드 내용
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {historyCard.content}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col min-h-80vh max-h-80vh gap-2 px-10 pt-5 pb-10">
            <MyPrayCardUI prayCard={historyCard} isHistoryView={true} />
            <PrayListBtn prayDatas={historyCard?.pray} />
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default PrayCardHistoryDrawer;
