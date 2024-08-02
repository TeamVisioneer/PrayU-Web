import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";

const OpenShareDrawerBtn: React.FC = () => {
  return (
    <Drawer>
      <DrawerTrigger className="bg-yellow-300 w-32">
        <p>그룹 초대하기</p>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>초대</DrawerTitle>
          <DrawerDescription>초대 명세</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
};

export default OpenShareDrawerBtn;
