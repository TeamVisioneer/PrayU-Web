import useBaseStore from "@/stores/baseStore";
import TodayPrayBtn from "./TodayPrayBtn";
import { PrayType } from "@/Enums/prayType";

export const TodayPrayStartCard = () => {
  const member = useBaseStore((state) => state.targetMember);
  const reactionDatas = useBaseStore((state) => state.reactionDatas);

  const reactionImages = [
    { type: PrayType.PRAY, opacity: "opacity-40" },
    { type: PrayType.GOOD, opacity: "opacity-70" },
    { type: PrayType.LIKE, opacity: "" },
    { profile: true },
    { type: PrayType.PRAY, opacity: "" },
    { type: PrayType.GOOD, opacity: "opacity-70" },
    { type: PrayType.LIKE, opacity: "opacity-40" },
  ];

  return (
    <>
      <div className="flex flex-col gap-2 border rounded-2xl shadow-md bg-gradient-to-b from-start/40 via-middle/40 via-30% to-end/40 justify-center items-center w-6/7 h-60vh">
        <div className="flex flex-col text-center gap-4">
          <div className="flex flex-col gap-10">
            <div className="flex justify-center gap-2 items-center max-w-full">
              <div className="flex justift-center items-center gap-2">
                {reactionImages.map((reaction, index) =>
                  reaction.profile ? (
                    <img
                      key={index}
                      src={member?.profiles.avatar_url || ""}
                      className="w-14 h-14 rounded-full ring-2 ring-[#FFBFBD]/50 drop-shadow-[0_0_10px_rgb(255,148,146,0.8)]"
                    />
                  ) : (
                    <img
                      key={index}
                      src={reactionDatas[reaction.type!]?.img}
                      alt={reactionDatas[reaction.type!]?.emoji}
                      className={`w-7 h-7 ${reaction.opacity}`}
                    />
                  )
                )}
              </div>
            </div>
            <h1 className="font-bold text-xl">오늘의 기도를 시작해보세요</h1>
          </div>

          <div className="text-grayText">
            <h1>그룹원의 기도제목이</h1>
            <h1 className="mb-5">당신의 기도를 기다리고 있어요</h1>
          </div>
        </div>
        <TodayPrayBtn />
      </div>
    </>
  );
};

export default TodayPrayStartCard;
