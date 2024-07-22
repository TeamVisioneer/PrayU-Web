import { DrawerTrigger } from "@/components/ui/drawer";

interface TodayPrayBtnProps {
  currentUserId: string | undefined;
}

const TodayPrayBtn: React.FC<TodayPrayBtnProps> = () => {
  const todayPrayBtn = (
    <div
      className="className= flex flex-col justify-center h-12
      bg-blue-950 text-white
      rounded cursor-pointer
      "
    >
      오늘의 기도
    </div>
  );

  return <DrawerTrigger>{todayPrayBtn}</DrawerTrigger>;
};

export default TodayPrayBtn;
