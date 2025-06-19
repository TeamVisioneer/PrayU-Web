import useBaseStore from "@/stores/baseStore";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import TodayPrayBtn from "../todayPray/TodayPrayBtn";
import { KakaoShareButton, TodayPrayLink } from "../share/KakaoShareBtn";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import { isCurrentWeek, isToday } from "@/lib/utils";

const PrayListDrawer: React.FC = () => {
  const isOpenMyPrayDrawer = useBaseStore((state) => state.isOpenMyPrayDrawer);
  const setIsOpenMyPrayDrawer = useBaseStore(
    (state) => state.setIsOpenMyPrayDrawer
  );
  const user = useBaseStore((state) => state.user);

  const groupAndSortByUserId = useBaseStore(
    (state) => state.groupAndSortByUserId
  );
  const isPrayTodayForMember = useBaseStore(
    (state) => state.isPrayTodayForMember
  );
  const targetPrayCard = useBaseStore((state) => state.targetPrayCard);

  const prayerList = groupAndSortByUserId(user!.id, targetPrayCard?.pray || []);
  const lenPrayerList = Object.keys(prayerList).length;
  const isOnlyMyPrayInPrayerList =
    lenPrayerList == 1 && Object.keys(prayerList).includes(user!.id);

  const isExpired = !isCurrentWeek(targetPrayCard?.created_at);

  const blurCondition =
    lenPrayerList > 0 &&
    !isExpired &&
    !isPrayTodayForMember &&
    !isOnlyMyPrayInPrayerList;

  return (
    <Drawer
      open={isOpenMyPrayDrawer}
      onOpenChange={(open) => {
        setIsOpenMyPrayDrawer(open);
        if (!open && window.history.state?.open === true) window.history.back();
      }}
    >
      <DrawerContent className="h-[400px] bg-mainBg border-none">
        <DrawerHeader>
          <DrawerTitle className="p-4 text-center">기도해 준 친구</DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>

        {blurCondition && (
          <div className="absolute w-full h-full rounded-t-[20px] inset-0 flex flex-col items-center justify-center z-10 bg-black bg-opacity-20 gap-3">
            <TodayPrayBtn
              groupId={targetPrayCard?.group_id || undefined}
              eventOption={{ where: "PrayList" }}
            />
            <p className="text-gray-500 text-sm">
              오늘의 기도를 완료해야 볼 수 있어요!
            </p>
          </div>
        )}
        <div className="overflow-y-auto justify-center items-center">
          {lenPrayerList === 0 ? (
            <div className="flex flex-col items-center gap-6 px-4">
              <div className="h-[150px] w-full flex flex-col items-center">
                <img
                  className="h-full rounded-md shadow-prayCard"
                  src="/images/prayList.png"
                />
              </div>
              <div className="flex flex-col text-gray-400 text-sm text-center">
                <p>아직 기도해 준 친구가 없어요 😭</p>
                <p>그룹 채팅방에 오늘의 기도 링크를 보내주세요</p>
              </div>
              <KakaoShareButton
                className="w-48"
                buttonText="오늘의 기도 링크 공유"
                kakaoLinkObject={TodayPrayLink()}
                eventOption={{ where: "PrayList" }}
              />
            </div>
          ) : (
            Object.keys(prayerList).map((user_id) => (
              <div
                key={user_id}
                className={`flex items-center justify-between p-3 px-4 ${
                  blurCondition && "blur"
                }`}
              >
                <div className="flex items-center gap-2">
                  <img
                    className="w-8 h-8 rounded-full border object-cover"
                    src={
                      prayerList[user_id][0].profiles.avatar_url ||
                      "/images/defaultProfileImage.png"
                    }
                    onError={(
                      e: React.SyntheticEvent<HTMLImageElement, Event>
                    ) => {
                      e.currentTarget.src = "/images/defaultProfileImage.png";
                    }}
                  />
                  {user_id == user!.id ? (
                    <p className="font-medium">내가 한 기도</p>
                  ) : (
                    <p className="font-medium">
                      {prayerList[user_id][0].profiles.full_name}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {prayerList[user_id].map((pray) => (
                    <img
                      key={pray.id}
                      src={PrayTypeDatas[pray.pray_type as PrayType]?.img}
                      className={`rounded-full  border-2 ${
                        isToday(pray.created_at)
                          ? "border-yellow-300"
                          : "border-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PrayListDrawer;
