import useBaseStore from "@/stores/baseStore";
import WeeklyCalendar from "./WeeklyCalendar";
import { PrayCardWithProfiles } from "supabase/types/tables";
import ReactionBtn from "./ReactionBtn";
import { KakaoShareButton } from "../KakaoShareBtn";

interface EventOption {
  where: string;
}

interface PrayCardProps {
  prayCard: PrayCardWithProfiles | null;
  eventOption: EventOption;
}

const ReactionWithCalendar: React.FC<PrayCardProps> = ({
  prayCard,
  eventOption,
}) => {
  const prayDataHash = useBaseStore((state) => state.prayDataHash);
  const currentUserId = useBaseStore((state) => state.user?.id);

  if (!prayCard) {
    return (
      <div className="flex flex-col items-center justify-center p-4 gap-4">
        <p>기도제목이 업데이트 되지 않았어요</p>
        <KakaoShareButton
          groupPageUrl={window.location.href}
          message="기도제목 요청하기"
          id="prayCardUIToOther"
          eventOption={{ where: "ReactionWithCalendar" }}
        ></KakaoShareButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
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
