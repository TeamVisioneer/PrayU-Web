import { useState, useRef, useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import { PrayCardWithProfiles } from "supabase/types/tables";
import { MemberWithProfiles } from "supabase/types/tables";
import { ClipLoader } from "react-spinners";
import ReactionWithCalendar from "./ReactionWithCalendar";

interface PrayCardProps {
  currentUserId: string;
  prayCard: PrayCardWithProfiles | null;
  member?: MemberWithProfiles | null;
}

const PrayCardUI: React.FC<PrayCardProps> = ({
  currentUserId,
  member,
  prayCard,
}) => {
  const { prayDataHash, fetchPrayDataByUserId } = useBaseStore((state) => ({
    prayDataHash: state.prayDataHash,
    fetchPrayDataByUserId: state.fetchPrayDataByUserId,
  }));

  const [isOverflow, setIsOverflow] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prayCard?.id) {
      fetchPrayDataByUserId(prayCard.id, currentUserId);
    }
  }, [currentUserId, fetchPrayDataByUserId, prayCard?.id]);

  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement) {
      const isContentOverflowing =
        contentElement.scrollHeight > contentElement.clientHeight;
      setIsOverflow(isContentOverflowing);
    }
  }, [prayCard?.content, member?.pray_summary]);

  if (!prayDataHash) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative flex flex-col h-50vh min-h-[300px] bg-white rounded-2xl shadow-md">
        <div className="bg-gradient-to-r from-start/60 via-middle/60 h-15vh via-30% to-end/60 flex flex-col justify-center items-start gap-1 rounded-t-2xl p-5">
          <div className="flex items-center gap-2 w-full">
            <img
              src={
                prayCard?.profiles.avatar_url ||
                member?.profiles.avatar_url ||
                ""
              }
              className="w-6 h-6 rounded-full"
            />
            <p className="text-white text-lg">
              {prayCard?.profiles.full_name || member?.profiles.full_name}
            </p>
          </div>
          <p className="text-xs text-white w-full text-left">
            시작일 :{" "}
            {prayCard?.created_at.split("T")[0] ||
              member?.updated_at.split("T")[0]}
          </p>
        </div>
        <div
          ref={contentRef}
          className={"p-2 items-start h-full overflow-y-auto no-scrollbar"}
        >
          <p className="whitespace-pre-line">
            {prayCard?.content || member?.pray_summary}
          </p>
        </div>
      </div>
      <ReactionWithCalendar prayCard={prayCard} />
    </div>
  );
};

export default PrayCardUI;
