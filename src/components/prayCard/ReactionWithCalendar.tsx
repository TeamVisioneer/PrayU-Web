import useBaseStore from "@/stores/baseStore";
import WeeklyCalendar from "./WeeklyCalendar";
import { PrayCardWithProfiles } from "supabase/types/tables";
import ReactionBtn from "./ReactionBtn";

interface PrayCardProps {
  prayCard: PrayCardWithProfiles;
  eventOption: { where: string; total_member: number };
}

const ReactionWithCalendar: React.FC<PrayCardProps> = ({
  prayCard,
  eventOption,
}) => {
  const currentUserId = useBaseStore((state) => state.user?.id);

  return (
    <div className="flex flex-col gap-6 p-2">
      <WeeklyCalendar prayCard={prayCard} />
      <ReactionBtn
        currentUserId={currentUserId!}
        prayCard={prayCard}
        eventOption={eventOption}
      />
    </div>
  );
};

export default ReactionWithCalendar;
