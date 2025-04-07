import useBaseStore from "@/stores/baseStore";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import TodayPrayCardList from "./TodayPrayCardList";
// import ReactionWithCalendar from "../prayCard/ReactionWithCalendar";

const TodayPrayCardListDrawer: React.FC = () => {
  const isOpenTodayPrayDrawer = useBaseStore(
    (state) => state.isOpenTodayPrayDrawer
  );
  const setIsOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setIsOpenTodayPrayDrawer
  );

  const prayCardCarouselList = useBaseStore(
    (state) => state.prayCardCarouselList
  );
  const prayCardCarouselIndex = useBaseStore(
    (state) => state.prayCardCarouselIndex
  );
  const isPrayToday = useBaseStore((state) => state.isPrayToday);
  const memberList = useBaseStore((state) => state.memberList);

  return (
    <Drawer
      open={isOpenTodayPrayDrawer}
      onOpenChange={(open) => {
        setIsOpenTodayPrayDrawer(open);
        if (!open && window.history.state?.open === true) window.history.back();
      }}
    >
      <DrawerContent className="bg-mainBg flex flex-col pb-5">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription className="text-sm text-center text-gray-400 p-2 h-10">
            {memberList?.length == 1 && prayCardCarouselIndex == 1
              ? "나눔을 위한 예시 기도 카드입니다"
              : prayCardCarouselList &&
                ((memberList?.length === 1
                  ? prayCardCarouselIndex === prayCardCarouselList.length + 2 &&
                    !isPrayToday
                  : prayCardCarouselIndex === prayCardCarouselList.length + 1 &&
                    !isPrayToday) ||
                  (memberList?.length === 1
                    ? prayCardCarouselIndex !== prayCardCarouselList.length + 2
                    : prayCardCarouselIndex !==
                      prayCardCarouselList.length + 1)) &&
                `${prayCardCarouselList?.length || 0}명 중 ${
                  prayCardCarouselList?.length == 1 ? 1 : prayCardCarouselIndex
                }번째 기도`}
          </DrawerDescription>
        </DrawerHeader>
        <TodayPrayCardList />
        <p
          className={`text-gray-400 text-sm text-center pt-2 ${
            isPrayToday ? "invisible" : ""
          }`}
        >
          기도 반응 버튼을 눌러 오늘의 기도를 남겨요
        </p>
      </DrawerContent>
    </Drawer>
  );
};

export default TodayPrayCardListDrawer;
