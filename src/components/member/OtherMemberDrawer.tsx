import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import useBaseStore from "@/stores/baseStore";
import OtherPrayCardUI from "../prayCard/OtherPrayCardUI";

const OtherMemberDrawer: React.FC = () => {
  const user = useBaseStore((state) => state.user);
  const isOpenOtherMemberDrawer = useBaseStore(
    (state) => state.isOpenOtherMemberDrawer
  );
  const setIsOpenOtherMemberDrawer = useBaseStore(
    (state) => state.setIsOpenOtherMemberDrawer
  );

  return (
    <Drawer
      open={isOpenOtherMemberDrawer}
      onOpenChange={setIsOpenOtherMemberDrawer}
    >
      <DrawerContent className="bg-mainBg pb-5">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <OtherPrayCardUI
          currentUserId={user!.id}
          eventOption={{ where: "OtherMember" }}
        />
      </DrawerContent>
    </Drawer>
  );
};

export default OtherMemberDrawer;
