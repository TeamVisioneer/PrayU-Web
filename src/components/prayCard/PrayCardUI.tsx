import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";
import { PrayCardWithProfiles } from "supabase/types/tables";
import PrayCardCalendar from "./WeeklyCalendar";
import ReactionBtn from "./ReactionBtn";
import { ClipLoader } from "react-spinners";

interface PrayCardProps {
  currentUserId: string | undefined;
  prayCard: PrayCardWithProfiles | undefined;
}

const PrayCardUI: React.FC<PrayCardProps> = ({ currentUserId, prayCard }) => {
  const prayDataHash = useBaseStore((state) => state.prayDataHash);
  const fetchPrayDataByUserId = useBaseStore(
    (state) => state.fetchPrayDataByUserId
  );

  useEffect(() => {
    fetchPrayDataByUserId(prayCard?.id, currentUserId);
  }, [fetchPrayDataByUserId, prayCard?.id, currentUserId]);

  if (!prayDataHash[prayCard?.id || ""]) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  const PrayCardBody = (
    <div className="flex flex-col h-50vh p-5 bg-blue-50 rounded-2xl">
      <div className="flex items-center gap-2">
        <img
          src={prayCard?.profiles.avatar_url || ""}
          className="w-5 h-5 rounded-full"
        />
        <div className="text-sm">{prayCard?.profiles.full_name}</div>
      </div>
      <div className="flex h-full justify-center items-center">
        {prayCard?.content}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {PrayCardBody}
      {currentUserId != prayCard?.user_id && (
        <div className="flex flex-col gap-6">
          <PrayCardCalendar
            prayCard={prayCard}
            prayData={prayDataHash[prayCard?.id || ""] || []}
          />
          <ReactionBtn currentUserId={currentUserId} prayCard={prayCard} />
        </div>
      )}
    </div>
  );
};

export default PrayCardUI;
