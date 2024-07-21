import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import PrayCardList from "./PrayCardList";

interface TodayPrayBtnProps {
  currentUserId: string | undefined;
}

const TodayPrayBtn: React.FC<TodayPrayBtnProps> = ({ currentUserId }) => {
  const todayPrayBtn = (
    <div
      className="className= flex flex-col justify-center h-12
      bg-black text-white
      rounded cursor-pointer
      "
    >
      오늘의 기도
    </div>
  );

  return (
    <Drawer>
      <DrawerTrigger>{todayPrayBtn}</DrawerTrigger>
      <DrawerContent className="max-w-[480px] mx-auto w-full h-[90%] pb-20">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        {/* PrayCardList */}
        <PrayCardList currentUserId={currentUserId} />
        {/* PrayCardList */}
      </DrawerContent>
    </Drawer>
  );
};

export default TodayPrayBtn;
