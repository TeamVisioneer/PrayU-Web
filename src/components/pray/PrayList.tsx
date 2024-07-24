import useBaseStore from "@/stores/baseStore";
import {
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { PrayType } from "@/Enums/prayType";

const PrayList: React.FC = () => {
  const prayerList = useBaseStore((state) => state.prayerList);
  const reactionDatas = useBaseStore((state) => state.reactionDatas);

  console.log(prayerList);

  const isPrayerListEmpty = !prayerList || Object.keys(prayerList).length === 0;

  return (
    <DrawerContent className="h-[400px]">
      <DrawerHeader>
        <DrawerTitle>기도해준 사람</DrawerTitle>
      </DrawerHeader>
      <DrawerDescription></DrawerDescription>
      <div className="h-full overflow-y-auto flex justify-center items-center">
        {isPrayerListEmpty ? (
          <div className="flex-col">
            <p>아직 기도해준 사람이 없어요</p>
            <p>그룹원들의 기도를 독려해봐요</p>
          </div>
        ) : (
          Object.keys(prayerList).map((user_id) => (
            <div
              key={user_id}
              className="flex items-center justify-between p-3 px-4"
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
          ))
        )}
      </div>
    </DrawerContent>
  );
};

export default PrayList;
