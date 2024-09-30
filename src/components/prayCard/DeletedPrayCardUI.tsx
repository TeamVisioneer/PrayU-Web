import { KakaoShareButton } from "../share/KakaoShareBtn";
import useBaseStore from "@/stores/baseStore";
import OtherPrayCardMenuBtn from "./OtherPrayCardMenuBtn";

const ExpiredPrayCardUI: React.FC = () => {
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const otherMember = useBaseStore((state) => state.otherMember);

  if (!otherMember) return null;

  return (
    <div className="flex flex-col gap-2 min-h-80vh max-h-80vh px-10">
      <div className="flex justify-end px-2">
        <OtherPrayCardMenuBtn
          targetUserId={otherMember.user_id || ""}
          prayContent={otherMember.pray_summary || ""}
        />
      </div>
      <div className="flex flex-col flex-grow min-h-full max-h-full bg-white rounded-2xl shadow-prayCard">
        <div className="flex flex-col justify-center items-start gap-1 bg-gradient-to-r from-start via-middle via-30% to-end rounded-t-2xl p-5">
          <div className="flex items-center gap-2">
            <img
              src={
                otherMember.profiles.avatar_url ||
                "/images/defaultProfileImage.png"
              }
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                e.currentTarget.src = "/images/defaultProfileImage.png";
              }}
              className="w-7 h-7 rounded-full object-cover"
            />
            <p className="text-white text-lg">
              {otherMember.profiles.full_name}
            </p>
          </div>
        </div>
        <div className="flex flex-col flex-grow min-h-full max-h-full items-start px-[10px] py-[10px] overflow-y-auto no-scrollbar">
          <p className="flex-grow w-full p-2 rounded-md text-sm overflow-y-auto no-scrollbar whitespace-pre-wrap ">
            {""}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center p-4 gap-4">
        <div className="flex flex-col items-center gap-1">
          <p className="font-bold">기도제목이 아직 없어요 😂</p>
          <p className="text-sm">기도제목을 요청해봐요!</p>
        </div>

        <KakaoShareButton
          targetGroup={targetGroup}
          message="카카오톡으로 요청하기"
          eventOption={{ where: "ReactionWithCalendar" }}
        ></KakaoShareButton>
      </div>
    </div>
  );
};

export default ExpiredPrayCardUI;
