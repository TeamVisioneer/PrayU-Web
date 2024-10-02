import useBaseStore from "@/stores/baseStore";
import TodayPrayBtn from "./TodayPrayBtn";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";

export const TodayPrayStartCard = () => {
  const member = useBaseStore((state) => state.myMember);

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
    <div className="flex flex-col flex-grow justify-center items-center text-center gap-8 border rounded-2xl shadow-prayCard bg-gradient-to-b from-start/40 via-middle/40 via-30% to-end/40  ">
      <div className="flex justify-center items-center gap-2">
        {reactionImages.map((reaction, index) =>
          reaction.profile ? (
            <img
              key={index}
              src={
                member?.profiles.avatar_url || "/images/defaultProfileImage.png"
              }
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                e.currentTarget.src = "/images/defaultProfileImage.png";
              }}
              className="w-14 h-14 rounded-full ring-2 ring-[#FFBFBD]/50 drop-shadow-[0_0_10px_rgb(255,148,146,0.8)] object-cover"
            />
          ) : (
            <img
              key={index}
              src={PrayTypeDatas[reaction.type!]?.img}
              alt={PrayTypeDatas[reaction.type!]?.emoji}
              className={`w-7 h-7 ${reaction.opacity}`}
            />
          )
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-xl">오늘의 기도를 시작해 보세요</h1>
        <div className="text-grayText">
          <h1>친구의 기도제목이</h1>
          <h1>당신의 기도를 기다리고 있어요 :)</h1>
        </div>
      </div>
      <TodayPrayBtn eventOption={{ where: "TodayPrayStartCard" }} />
    </div>
  );
};

export default TodayPrayStartCard;
