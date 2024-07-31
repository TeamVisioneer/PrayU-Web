import useBaseStore from "@/stores/baseStore";
import { Button } from "../ui/button";

const MyMemberBtn: React.FC = () => {
  const setIsOpenMyMemberDrawer = useBaseStore(
    (state) => state.setIsOpenMyMemberDrawer
  );
  const setOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setOpenTodayPrayDrawer
  );

  return (
    <Button
      className="shadow-md
        flex flex-col justify-center w-32 h-11
        bg-todayPrayBtn text-white
        rounded-xl cursor-pointer"
      onClick={() => {
        setOpenTodayPrayDrawer(false);
        setIsOpenMyMemberDrawer(true);
      }}
    >
      내 기도 확인하기
    </Button>
  );
};

export default MyMemberBtn;
