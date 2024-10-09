import useBaseStore from "@/stores/baseStore";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import { KakaoShareButton, TodayPrayLink } from "../share/KakaoShareBtn";
import { PrayWithProfiles } from "supabase/types/tables";
import { isToday } from "@/lib/utils";
import TodayPrayBtn from "../todayPray/TodayPrayBtn";

interface PrayListProps {
  prayData: PrayWithProfiles[];
}

const PrayList: React.FC<PrayListProps> = ({ prayData }) => {
  const user = useBaseStore((state) => state.user);
  const isPrayTodayForMember = useBaseStore(
    (state) => state.isPrayTodayForMember
  );
  const groupAndSortByUserId = useBaseStore(
    (state) => state.groupAndSortByUserId
  );
  const prayerList = groupAndSortByUserId(prayData);
  const lenPrayerList = Object.keys(prayerList).length;
  const isOnlyMyPrayInPrayerList =
    lenPrayerList == 1 && Object.keys(prayerList).includes(user!.id);

  return (
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
        <>
          {Object.keys(prayerList).map((user_id) => (
            <div
              key={user_id}
              className={`flex items-center justify-between p-3 px-4 ${
                !isPrayTodayForMember && !isOnlyMyPrayInPrayerList && "blur"
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
                <p className="font-medium">
                  {prayerList[user_id][0].profiles.full_name}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {prayerList[user_id].map((pray) => (
                  <img
                    key={pray.id}
                    src={PrayTypeDatas[pray.pray_type as PrayType]?.img}
                    className={`rounded-full  border-2
                        ${
                          isToday(pray.created_at)
                            ? "border-yellow-300"
                            : "border-transparent"
                        }`}
                  />
                ))}
              </div>
            </div>
          ))}
          {!isPrayTodayForMember && !isOnlyMyPrayInPrayerList && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black bg-opacity-20 gap-3">
              <TodayPrayBtn eventOption={{ where: "PrayList" }} />
              <p className="text-gray-500 text-sm">
                오늘의 기도를 완료해야 볼 수 있어요!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PrayList;
