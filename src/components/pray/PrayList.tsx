import useBaseStore from "@/stores/baseStore";
import {
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import { KakaoShareButton } from "../share/KakaoShareBtn";
import { PrayWithProfiles } from "supabase/types/tables";

interface PrayListProps {
  prayData: PrayWithProfiles[];
}

const PrayList: React.FC<PrayListProps> = ({ prayData }) => {
  const isPrayToday = useBaseStore((state) => state.isPrayToday);
  const groupAndSortByUserId = useBaseStore(
    (state) => state.groupAndSortByUserId
  );
  // const setIsOpenMyPrayDrawer = useBaseStore(
  //   (state) => state.setIsOpenMyPrayDrawer
  // );

  const prayerList = groupAndSortByUserId(prayData);
  const isPrayerListEmpty = !prayerList || Object.keys(prayerList).length === 0;

  return (
    <DrawerContent
      className="max-w-[480px] mx-auto w-full h-[400px] focus:outline-none"
      //onOpenChange={setIsOpenMyPrayDrawer}
      // onOpenChange={() => {}}
    >
      <DrawerHeader>
        <DrawerTitle>기도해 준 친구</DrawerTitle>
        <DrawerDescription></DrawerDescription>
      </DrawerHeader>
      <div className="overflow-y-auto justify-center items-center">
        {isPrayerListEmpty ? (
          <div className="flex flex-col items-center gap-6 px-4">
            <div className="h-[150px] flex flex-col items-center">
              <img
                className="h-full rounded-md shadow-prayCard"
                src="/images/prayList.png"
              />
            </div>
            <div className="flex flex-col text-gray-400 text-sm text-center">
              <p>아직 기도해 준 친구가 없어요 😭</p>
              <p>그룹 채팅방에 오늘의 기도 링크를 공유해 보아요</p>
            </div>
            <KakaoShareButton
              groupPageUrl={window.location.href}
              message="카카오톡 링크 공유"
              id="prayList"
              eventOption={{ where: "PrayList" }}
            />
          </div>
        ) : (
          <>
            {Object.keys(prayerList).map((user_id) => (
              <div
                key={user_id}
                className={`flex items-center justify-between p-3 px-4 ${
                  !isPrayToday ? "blur" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <img
                    className="w-8 h-8 rounded-full border"
                    src={prayerList[user_id][0].profiles.avatar_url ?? ""}
                    alt={`${prayerList[user_id][0].profiles.full_name} avatar`}
                  />
                  <p className="font-medium">
                    {prayerList[user_id][0].profiles.full_name}
                  </p>
                </div>
                <div className="flex gap-2">
                  {prayerList[user_id].map((pray) => (
                    <p key={pray.id} className="text-xl text-gray-500">
                      {
                        <img
                          src={PrayTypeDatas[pray.pray_type as PrayType]?.img}
                          alt={PrayTypeDatas[pray.pray_type as PrayType]?.emoji}
                        ></img>
                      }
                    </p>
                  ))}
                </div>
              </div>
            ))}
            {!isPrayToday && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-20">
                <div className="bg-blue-950 text-white p-4 rounded-xl">
                  <p className="text-lg text-white font-semibold">
                    오늘의 기도를 완료해주세요
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DrawerContent>
  );
};

export default PrayList;
