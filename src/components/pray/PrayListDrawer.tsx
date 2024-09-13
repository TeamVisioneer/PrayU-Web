import PrayList from "./PrayList";
import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";
import { fetchUserPrayCardListByGroupId } from "@/apis/prayCard";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

interface PrayListDrawerProps {
  currentUserId: string;
  groupId: string;
}

// TODO: PrayList 랑 합치고 prayCard.pray 를 props 로 받기, 렌더링 언제 되는지 확인
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

  if (!userPrayCardList || userPrayCardList.length === 0) {
    return null;
  }
  const prayCard = userPrayCardList[0];

  return (
    <Drawer open={isOpenMyPrayDrawer} onOpenChange={setIsOpenMyPrayDrawer}>
      <DrawerContent className="h-[400px]">
        <DrawerHeader>
          <DrawerTitle className="p-4">기도해 준 친구</DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <PrayList prayData={prayCard.pray} />
      </DrawerContent>
    </Drawer>
  );
};

export default PrayListDrawer;
