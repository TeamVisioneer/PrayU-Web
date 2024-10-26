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
  const memberList = useBaseStore((state) => state.memberList);
  const isOpenOtherMemberDrawer = useBaseStore(
    (state) => state.isOpenOtherMemberDrawer
  );
  const setIsOpenOtherMemberDrawer = useBaseStore(
    (state) => state.setIsOpenOtherMemberDrawer
  );

  if (!memberList) return null;

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
          eventOption={{
            where: "OtherMember",
            total_member: memberList.length,
          }}
        />
      </DrawerContent>
    </Drawer>
  );
};

export default OtherMemberDrawer;
