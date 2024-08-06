import { MemberWithProfiles } from "supabase/types/tables";
import { Textarea } from "../ui/textarea";
import { getDateDistance } from "@toss/date";
import { getISOOnlyDate, getISOTodayDate } from "@/lib/utils";
import { KakaoShareButton } from "../share/KakaoShareBtn";

interface ExpiredPrayCardProps {
  member: MemberWithProfiles;
}

const ExpiredPrayCardUI: React.FC<ExpiredPrayCardProps> = ({ member }) => {
  const dateDistance = getDateDistance(
    new Date(getISOOnlyDate(member.updated_at)),
    new Date(getISOTodayDate())
  );

  return (
    <div className="flex flex-col gap-6 min-h-[80vh] max-h-[80vh]">
      <div className="flex flex-col flex-grow min-h-full max-h-full bg-white rounded-2xl shadow-prayCard">
        <div className="flex flex-col justify-center items-start gap-1 bg-gradient-to-r from-start/60 via-middle/60 via-30% to-end/60 rounded-t-2xl p-5">
          <div className="flex items-center gap-2">
            <img
              src={member.profiles.avatar_url || ""}
              className="w-7 h-7 rounded-full"
            />
            <p className="text-white text-lg">{member?.profiles.full_name}</p>
          </div>
          <p className="text-sm text-white w-full text-left">
            시작일 : {member.updated_at.split("T")[0]}
          </p>
        </div>
        <div className="flex flex-col flex-grow min-h-full max-h-full items-start px-[10px] py-[10px] overflow-y-auto no-scrollbar">
          <Textarea
            className="flex-grow w-full p-2 rounded-md overflow-y-auto no-scrollbar text-black !opacity-100 !border-none !cursor-default"
            value={member.pray_summary || ""}
            disabled={true}
          />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center p-4 gap-4">
        <div className="flex flex-col items-center gap-1">
          <p className="font-bold">
            작성 된 지 {dateDistance.days}일이 되었어요 😂
          </p>
          <p className="text-sm">기도제목을 요청해봐요!</p>
        </div>

        <KakaoShareButton
          groupPageUrl={window.location.href}
          message="카카오톡으로 요청하기"
          id="prayCardUIToOther"
          eventOption={{ where: "ReactionWithCalendar" }}
        ></KakaoShareButton>
      </div>
    </div>
  );
};

export default ExpiredPrayCardUI;
