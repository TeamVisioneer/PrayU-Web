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
      onOpenChange={setIsOpenTodayPrayDrawer}
    >
      <DrawerContent className="bg-mainBg flex flex-col">
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
        {/* <div className="px-5 pt-5">
          <ReactionWithCalendar
            prayCard={prayCardCarouselList?.[prayCardCarouselIndex - 1]}
            eventOption={{
              where: "TodayPrayCardListDrawer",
              total_member: prayCardCarouselList?.length || 0,
            }}
          />
        </div> */}
      </DrawerContent>
    </Drawer>
  );
};

export default TodayPrayCardListDrawer;
