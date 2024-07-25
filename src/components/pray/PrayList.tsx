import useBaseStore from "@/stores/baseStore";
import {
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { PrayType } from "@/Enums/prayType";
import { KakaoShareButton } from "../KakaoShareBtn";

const PrayList: React.FC = () => {
  const prayerList = useBaseStore((state) => state.prayerList);
  const reactionDatas = useBaseStore((state) => state.reactionDatas);
  const isPrayToday = useBaseStore((state) => state.isPrayToday);

  const isPrayerListEmpty = !prayerList || Object.keys(prayerList).length === 0;

  return (
    <DrawerContent className="h-[400px] focus:outline-none">
      <DrawerHeader>
        <DrawerTitle>기도해준 사람</DrawerTitle>
      </DrawerHeader>
      <DrawerDescription></DrawerDescription>
      <div className="overflow-y-auto justify-center items-center">
        {isPrayerListEmpty ? (
          <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-col text-gray-400 text-sm text-center">
              <p>아직 기도해준 사람이 없어요</p>
              <p>그룹원들의 기도를 독려해봐요</p>
            </div>
            <KakaoShareButton
              groupPageUrl={window.location.href}
              locate="prayList"
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
                    className="w-8 h-8 rounded-full"
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
                      {reactionDatas[pray.pray_type as PrayType]?.emoji}
                    </p>
                  ))}
                </div>
              </div>
            ))}
            {!isPrayToday && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-20">
                <div className="bg-blue-950 text-white p-4 rounded-xl">
                  <p className="text-lg text-white font-semibold">
                    오늘의 기도를 완료하세요
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
