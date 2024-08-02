import useBaseStore from "@/stores/baseStore";
import WeeklyCalendar from "./WeeklyCalendar";
import {
  MemberWithProfiles,
  PrayCardWithProfiles,
} from "supabase/types/tables";
import ReactionBtn from "./ReactionBtn";
import { KakaoShareButton } from "../share/KakaoShareBtn";
import { getDateDistance } from "@toss/date";
import { getISOOnlyDate, getISOTodayDate } from "@/lib/utils";

interface EventOption {
  where: string;
}

interface PrayCardProps {
  prayCard: PrayCardWithProfiles | null;
  eventOption: EventOption;
  member?: MemberWithProfiles | null;
}

const ReactionWithCalendar: React.FC<PrayCardProps> = ({
  prayCard,
  eventOption,
  member,
}) => {
  const prayDataHash = useBaseStore((state) => state.prayDataHash);
  const currentUserId = useBaseStore((state) => state.user?.id);

  const dateDistance = getDateDistance(
    new Date(getISOOnlyDate(member?.updated_at ?? null)),
    new Date(getISOTodayDate())
  );

  if (!prayCard) {
    return (
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
    );
  }

  return (
    <div className="flex flex-col gap-[33px] p-2">
      <WeeklyCalendar
        prayCard={prayCard}
        prayData={prayDataHash[prayCard?.id || ""] || []}
      />
      <ReactionBtn
        currentUserId={currentUserId!}
        prayCard={prayCard}
        eventOption={eventOption}
      />
    </div>
  );
};

export default ReactionWithCalendar;
