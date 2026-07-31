import { displayProfileName, profileAvatarUrl } from "@/lib/profileName";
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
import { useMemo } from "react";

const PrayListDrawer: React.FC = () => {
  const isOpenMyPrayDrawer = useBaseStore((state) => state.isOpenMyPrayDrawer);
  const setIsOpenMyPrayDrawer = useBaseStore(
    (state) => state.setIsOpenMyPrayDrawer
  );
  const user = useBaseStore((state) => state.user);

  const isPrayTodayForMember = useBaseStore(
    (state) => state.isPrayTodayForMember
  );
  const targetPrayCard = useBaseStore((state) => state.targetPrayCard);

  const prayerList = useMemo(() => {
    const prayerListSource = targetPrayCard?.pray || [];
    const grouped = prayerListSource.reduce<
      Record<string, (typeof prayerListSource)[number][]>
    >((acc, pray) => {
      const userId = pray.user_id;
      if (!userId) {
        return acc;
      }
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(pray);
      return acc;
    }, {});

    const sortedUserIds = Object.keys(grouped).sort((a, b) => {
      if (a === user!.id) return -1;
      if (b === user!.id) return 1;
      // You can add more sorting logic here if needed, e.g., by name
      const nameA = displayProfileName(grouped[a][0].profiles);
      const nameB = displayProfileName(grouped[b][0].profiles);
      return nameB.localeCompare(nameA);
    });

    return sortedUserIds.map((userId) => ({
      userId,
      prays: grouped[userId],
    }));
  }, [targetPrayCard?.pray, user]);

  const lenPrayerList = prayerList.length;
  const isOnlyMyPrayInPrayerList =
    lenPrayerList === 1 && prayerList[0].userId === user!.id;

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
          <div className="absolute w-full h-full rounded-t-[20px] inset-0 flex flex-col items-center justify-center z-10 bg-black bg-opacity-30 gap-6 px-6">
            <TodayPrayBtn
              groupId={targetPrayCard?.group_id || undefined}
              eventOption={{ where: "PrayList" }}
            />
            <div className="text-gray-900 text-base text-center leading-relaxed">
              <div className="font-medium">
                오늘의 기도를 완료해야 볼 수 있어요.
              </div>
              <div className="text-gray-600 text-sm mt-1">
                기도를 마무리하고 다시 들어와 보세요
              </div>
            </div>
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
            prayerList.map(({ userId, prays }) => {
              const displayLimit = 5;
              const sortedPrays = [...prays].sort((a, b) => {
                const aIsToday = isToday(a.created_at);
                const bIsToday = isToday(b.created_at);
                if (aIsToday === bIsToday) return 0;
                return aIsToday ? -1 : 1;
              });
              const visiblePrays = sortedPrays.slice(0, displayLimit);
              const hiddenPraysCount = sortedPrays.length - visiblePrays.length;

              return (
                <div
                  key={userId}
                  className={`flex items-center justify-between p-3 px-4 ${
                    blurCondition && "blur"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img
                      className="w-8 h-8 rounded-full border object-cover"
                      src={
                        profileAvatarUrl(prays[0].profiles) ||
                        "/images/defaultProfileImage.png"
                      }
                      onError={(
                        e: React.SyntheticEvent<HTMLImageElement, Event>
                      ) => {
                        e.currentTarget.src = "/images/defaultProfileImage.png";
                      }}
                    />
                    {userId == user!.id ? (
                      <p className="font-medium">내가 한 기도</p>
                    ) : (
                      <p className="font-medium">
                        {displayProfileName(prays[0].profiles)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-2">
                      {visiblePrays.map((pray, index) => (
                        <img
                          key={pray.id}
                          src={PrayTypeDatas[pray.pray_type as PrayType]?.img}
                          className={`relative h-6 w-6 rounded-full border-2 object-cover ${
                            isToday(pray.created_at)
                              ? "border-yellow-300"
                              : "border-white"
                          }`}
                          style={{ zIndex: visiblePrays.length - index }}
                        />
                      ))}
                    </div>
                    {hiddenPraysCount > 0 && (
                      <span className="text-xs text-gray-500">
                        +{hiddenPraysCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PrayListDrawer;
