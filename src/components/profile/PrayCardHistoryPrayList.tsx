import useBaseStore from "@/stores/baseStore";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import { KakaoShareButton, TodayPrayLink } from "../share/KakaoShareBtn";
import { isToday } from "@/lib/utils";

const PrayCardHistoryPrayList: React.FC = () => {
  const user = useBaseStore((state) => state.user);

  const groupAndSortByUserId = useBaseStore(
    (state) => state.groupAndSortByUserId
  );
  const historyCard = useBaseStore((state) => state.historyCard);

  if (!historyCard) return null;

  const prayerList = groupAndSortByUserId(user!.id, historyCard.pray);
  const lenPrayerList = Object.keys(prayerList).length;

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
            <p>기도해 준 친구가 없어요 😭</p>
            <p>그룹 채팅방에 오늘의 기도 링크를 보내주세요</p>
          </div>
          <KakaoShareButton
            className="w-48"
            buttonText="오늘의 기도 링크 공유"
            kakaoLinkObject={TodayPrayLink()}
            eventOption={{ where: "PrayCardHistoryPrayList" }}
          />
        </div>
      ) : (
        <>
          {Object.keys(prayerList).map((user_id) => (
            <div
              key={user_id}
              className="flex items-center justify-between p-3 px-4 "
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
          ))}
        </>
      )}
    </div>
  );
};

export default PrayCardHistoryPrayList;
