import useBaseStore from "@/stores/baseStore";
import PrayCardCalendar from "./WeeklyCalendar";
import { PrayCardWithProfiles } from "supabase/types/tables";
import ReactionBtn from "./ReactionBtn";
import { getISOTodayDate } from "@/lib/utils";
import { getDateDistance } from "@toss/date";
import { KakaoShareButton } from "../KakaoShareBtn";

interface PrayCardProps {
  prayCard: PrayCardWithProfiles | null;
}

const ReactionWithCalendar: React.FC<PrayCardProps> = ({ prayCard }) => {
  const prayDataHash = useBaseStore((state) => state.prayDataHash);
  const currentUserId = useBaseStore((state) => state.user?.id);
  const dateDistance = getDateDistance(
    new Date(prayCard!.created_at),
    new Date(getISOTodayDate())
  );

  if (dateDistance.days >= 6) {
    return (
      <div className="flex flex-col items-center justify-center p-4 gap-4">
        <p>기도제목이 업데이트 되지 않았어요</p>
        <KakaoShareButton
          groupPageUrl={window.location.href}
          message="기도제목 요청하기"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PrayCardCalendar
        prayCard={prayCard}
        prayData={prayDataHash[prayCard?.id || ""] || []}
      />
      <ReactionBtn currentUserId={currentUserId!} prayCard={prayCard} />
    </div>
  );
};

export default ReactionWithCalendar;
