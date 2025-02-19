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
      <DrawerContent className="bg-mainBg min-h-90vh max-h-90vh flex flex-col gap-4">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <div className="px-6 flex flex-col flex-grow gap-4">
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
