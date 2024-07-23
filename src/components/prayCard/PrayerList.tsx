import {
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

const PrayerList = () => {
  return (
    <DrawerContent className="h-[400px]">
      <DrawerHeader>
        <DrawerTitle>기도해준 사람</DrawerTitle>
      </DrawerHeader>
      <DrawerDescription></DrawerDescription>
    </DrawerContent>
  );
};

export default PrayerList;
