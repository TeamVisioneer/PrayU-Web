import { ClipLoader } from "react-spinners";
import { Drawer } from "../ui/drawer";
import PrayList from "./PrayList";
import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";
import { fetchUserPrayCardListByGroupId } from "@/apis/prayCard";

interface PrayListDrawerProps {
  currentUserId: string;
  groupId: string;
}

const PrayListDrawer: React.FC<PrayListDrawerProps> = ({
  currentUserId,
  groupId,
}) => {
  const userPrayCardList = useBaseStore((state) => state.userPrayCardList);
  const isOpenMyPrayDrawer = useBaseStore((state) => state.isOpenMyPrayDrawer);
  const setIsOpenMyPrayDrawer = useBaseStore(
    (state) => state.setIsOpenMyPrayDrawer
  );

  useEffect(() => {
    fetchUserPrayCardListByGroupId(currentUserId, groupId);
  }, [currentUserId, groupId]);

  if (!userPrayCardList) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  if (userPrayCardList.length === 0) {
    return null;
  }
  const prayCard = userPrayCardList[0];

  return (
    <Drawer open={isOpenMyPrayDrawer} onOpenChange={setIsOpenMyPrayDrawer}>
      <PrayList prayData={prayCard.pray} />
    </Drawer>
  );
};

export default PrayListDrawer;
