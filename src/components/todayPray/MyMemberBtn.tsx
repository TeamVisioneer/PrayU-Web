import useBaseStore from "@/stores/baseStore";
import { Button } from "../ui/button";

const MyMemberBtn: React.FC = () => {
  const setIsOpenMyMemberDrawer = useBaseStore(
    (state) => state.setIsOpenMyMemberDrawer
  );
  const setIsOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setIsOpenTodayPrayDrawer
  );

  return (
    <Button
      variant="primary"
      className="w-32"
      onClick={() => {
        setIsOpenTodayPrayDrawer(false);
        setIsOpenMyMemberDrawer(true);
      }}
    >
      내 기도 확인하기
    </Button>
  );
};

export default MyMemberBtn;
