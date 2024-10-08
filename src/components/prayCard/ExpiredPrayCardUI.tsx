import { getDateDistance } from "@toss/date";
import { getISODateYMD, getISOOnlyDate, getISOTodayDate } from "@/lib/utils";
import { ExpiredMemberLink, KakaoShareButton } from "../share/KakaoShareBtn";
import useBaseStore from "@/stores/baseStore";
import OtherPrayCardMenuBtn from "./OtherPrayCardMenuBtn";

const ExpiredPrayCardUI: React.FC = () => {
  const otherMember = useBaseStore((state) => state.otherMember);

  if (!otherMember) return null;

  const updatedAt = otherMember.updated_at;
  const updatedDateYMD = getISODateYMD(updatedAt);

  const dateDistance = getDateDistance(
    new Date(getISOOnlyDate(otherMember.updated_at)),
    new Date(getISOTodayDate())
  );

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
          <p className="text-sm text-white w-full text-left">
            시작일 : {updatedDateYMD.year}.{updatedDateYMD.month}.
            {updatedDateYMD.day}
          </p>
        </div>
        <div className="flex flex-col flex-grow min-h-full max-h-full items-start px-[10px] py-[10px] overflow-y-auto no-scrollbar">
          <p className="flex-grow w-full p-2 rounded-md text-sm overflow-y-auto no-scrollbar whitespace-pre-wrap ">
            {otherMember.pray_summary || ""}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center p-4 gap-4">
        <div className="flex flex-col items-center gap-1">
          {dateDistance.days >= 7 ? (
            <p className="font-bold">
              작성 된 지 {dateDistance.days}일이 되었어요 😂
            </p>
          ) : (
            <p className="font-bold">기도제목이 만료되었어요 😂</p>
          )}
          <p className="text-sm text-gray-400">
            {otherMember.profiles.full_name}님에게 기도제목을 요청해 보아요
          </p>
        </div>

        <KakaoShareButton
          className="w-48"
          buttonText="요청 메세지 보내기"
          kakaoLinkObject={ExpiredMemberLink()}
          eventOption={{ where: "ReactionWithCalendar" }}
        ></KakaoShareButton>
      </div>
    </div>
  );
};

export default ExpiredPrayCardUI;
