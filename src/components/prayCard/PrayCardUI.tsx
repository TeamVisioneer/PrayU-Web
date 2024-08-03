import { useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import { PrayCardWithProfiles } from "supabase/types/tables";
import { MemberWithProfiles } from "supabase/types/tables";
import { ClipLoader } from "react-spinners";
import ReactionWithCalendar from "./ReactionWithCalendar";

interface EventOption {
  where: string;
}

interface PrayCardProps {
  currentUserId: string;
  prayCard: PrayCardWithProfiles | null;
  member?: MemberWithProfiles | null;
  eventOption: EventOption;
}

const PrayCardUI: React.FC<PrayCardProps> = ({
  currentUserId,
  member,
  prayCard,
  eventOption,
}) => {
  const { prayDataHash, fetchPrayDataByUserId } = useBaseStore((state) => ({
    prayDataHash: state.prayDataHash,
    fetchPrayDataByUserId: state.fetchPrayDataByUserId,
  }));

  useEffect(() => {
    if (prayCard?.id) {
      fetchPrayDataByUserId(prayCard.id, currentUserId);
    }
  }, [currentUserId, fetchPrayDataByUserId, prayCard?.id]);

  if (!prayDataHash) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 min-h-[70vh] max-h-[70vh]">
      <div className="flex flex-col flex-grow min-h-full max-h-full bg-white rounded-2xl shadow-prayCard">
        <div className="flex flex-col justify-center items-start gap-1 bg-gradient-to-r from-start/60 via-middle/60 via-30% to-end/60 rounded-t-2xl p-5">
          <div className="flex items-center gap-2">
            <img
              src={
                prayCard?.profiles.avatar_url ||
                member?.profiles.avatar_url ||
                ""
              }
              className="w-7 h-7 rounded-full"
            />
            <p className="text-white text-lg">
              {prayCard?.profiles.full_name || member?.profiles.full_name}
            </p>
          </div>
          <p className="text-sm text-white w-full text-left">
            시작일 :{" "}
            {prayCard?.created_at.split("T")[0] ||
              member?.updated_at.split("T")[0]}
          </p>
        </div>
        <div className="flex flex-col flex-grow min-h-full max-h-full items-start px-[21px] py-[25px] overflow-y-auto no-scrollbar">
          <p className="whitespace-pre-line">
            {prayCard?.content || member?.pray_summary}
          </p>
        </div>
      </div>
      <ReactionWithCalendar
        prayCard={prayCard}
        eventOption={eventOption}
        member={member}
      />
    </div>
  );
};

export default PrayCardUI;
