import useBaseStore from "@/stores/baseStore";
import WeeklyCalendar from "./WeeklyCalendar";
import { PrayCardWithProfiles } from "supabase/types/tables";
import ReactionBtn from "./ReactionBtn";

interface EventOption {
  where: string;
}

interface PrayCardProps {
  prayCard: PrayCardWithProfiles;
  eventOption: EventOption;
}

const ReactionWithCalendar: React.FC<PrayCardProps> = ({
  prayCard,
  eventOption,
}) => {
  const prayDataHash = useBaseStore((state) => state.prayDataHash);
  const currentUserId = useBaseStore((state) => state.user?.id);

  return (
    <div className="flex flex-col gap-[33px] p-2">
      <WeeklyCalendar
        prayCard={prayCard}
        prayData={prayDataHash[prayCard.id] || []}
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
