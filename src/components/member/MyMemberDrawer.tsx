import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import useBaseStore from "@/stores/baseStore";
import PrayListBtn from "../pray/PrayListBtn";
import PrayCard from "../prayCard/PrayCard";

const MyMemberDrawer = () => {
  const userPrayCardList = useBaseStore((state) => state.userPrayCardList);

  const isOpenMyMemberDrawer = useBaseStore(
    (state) => state.isOpenMyMemberDrawer
  );
  const setIsOpenMyMemberDrawer = useBaseStore(
    (state) => state.setIsOpenMyMemberDrawer
  );

  return (
    <Drawer
      open={isOpenMyMemberDrawer}
      onOpenChange={(open) => {
        setIsOpenMyMemberDrawer(open);
        if (!open && window.history.state?.open === true) window.history.back();
      }}
    >
      <DrawerContent className="bg-mainBg">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-2 px-8 pt-5 pb-10">
          <PrayCard prayCard={userPrayCardList?.[0]} editable={true} />
          <PrayListBtn prayDatas={userPrayCardList?.[0]?.pray} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MyMemberDrawer;
