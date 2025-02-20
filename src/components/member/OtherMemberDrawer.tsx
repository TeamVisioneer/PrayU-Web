import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import useBaseStore from "@/stores/baseStore";
import PrayCardUI from "../prayCard/PrayCardUI";
import ReactionWithCalendar from "../prayCard/ReactionWithCalendar";

const OtherMemberDrawer: React.FC = () => {
  const memberList = useBaseStore((state) => state.memberList);
  const isOpenOtherMemberDrawer = useBaseStore(
    (state) => state.isOpenOtherMemberDrawer
  );
  const setIsOpenOtherMemberDrawer = useBaseStore(
    (state) => state.setIsOpenOtherMemberDrawer
  );
  const otherPrayCardList = useBaseStore((state) => state.otherPrayCardList);

  return (
    <Drawer
      open={isOpenOtherMemberDrawer}
      onOpenChange={setIsOpenOtherMemberDrawer}
    >
      <DrawerContent className="bg-mainBg flex flex-col">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <div className="px-10 pt-5 flex flex-col flex-grow min-h-80vh max-h-80vh gap-4">
          <PrayCardUI prayCard={otherPrayCardList?.[0]} />
          <ReactionWithCalendar
            prayCard={otherPrayCardList?.[0]}
            eventOption={{
              where: "TodayPrayCardListDrawer",
              total_member: memberList?.length || 0,
            }}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default OtherMemberDrawer;
