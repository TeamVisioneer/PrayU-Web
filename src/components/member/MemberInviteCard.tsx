import { Button } from "../ui/button";
import useBaseStore from "@/stores/baseStore";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";

export const MemberInviteCard = () => {
  const member = useBaseStore((state) => state.targetMember);

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
    <div className="flex flex-col flex-grow justify-center items-center text-center gap-5  border rounded-2xl shadow-prayCard bg-gradient-to-b from-start/40 via-middle/40 via-30% to-end/40  ">
      <div className="flex justify-center items-center gap-2">
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
              src={PrayTypeDatas[reaction.type!]?.img}
              alt={PrayTypeDatas[reaction.type!]?.emoji}
              className={`w-7 h-7 ${reaction.opacity}`}
            />
          )
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-xl">그룹원 초대</h1>
        <div className="text-grayText">
          <h1>친구들과 함께 오늘의 기도를 시작해 보아요</h1>
          <h1>기도제목을 공유하고 매일 기도해 주세요</h1>
        </div>
      </div>
      {/* TODO: 초대 드로워 트리거로 변경 */}
      <Button variant="primary">그룹원 초대하기</Button>
    </div>
  );
};

export default MemberInviteCard;
