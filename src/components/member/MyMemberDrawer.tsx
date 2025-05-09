import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import useBaseStore from "@/stores/baseStore";
import PrayListBtn from "../pray/PrayListBtn";
import PrayCard from "../prayCard/PrayCard";
import { isCurrentWeek } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const MyMemberDrawer = () => {
  const userPrayCardList = useBaseStore((state) => state.userPrayCardList);
  const navigate = useNavigate();

  const isOpenMyMemberDrawer = useBaseStore(
    (state) => state.isOpenMyMemberDrawer
  );
  const setIsOpenMyMemberDrawer = useBaseStore(
    (state) => state.setIsOpenMyMemberDrawer
  );

  const prayCard = userPrayCardList?.[0];
  const isExpired = prayCard && !isCurrentWeek(prayCard.created_at);

  return (
    <Drawer
      open={isOpenMyMemberDrawer}
      onOpenChange={(open) => {
        setIsOpenMyMemberDrawer(open);
        if (!open && window.history.state?.open === true) window.history.back();
      }}
    >
      <DrawerContent className="bg-mainBg">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-2 px-8 pt-5 pb-10">
          {isExpired && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
              <div className="">
                <span className="text-amber-800 font-medium">
                  일주일이 지나 기도카드가 만료되었어요!
                </span>
                <p className="text-amber-700 text-sm mt-1">
                  만료된 기도카드는 오늘의 기도에 공유되지 않아요😭
                </p>
              </div>

              <div
                className="text-blue-600 font-medium mt-2 text-sm underline cursor-pointer"
                onClick={() => navigate("/praycard/new")}
              >
                이번 주 기도카드 만들기 &gt;
              </div>
            </div>
          )}
          <PrayCard prayCard={userPrayCardList?.[0]} editable={true} />
          <PrayListBtn prayDatas={userPrayCardList?.[0]?.pray} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MyMemberDrawer;
