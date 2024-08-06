import { useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import { PrayCardWithProfiles } from "supabase/types/tables";
import { ClipLoader } from "react-spinners";
import ReactionWithCalendar from "./ReactionWithCalendar";
import { Textarea } from "../ui/textarea";

interface EventOption {
  where: string;
}

interface PrayCardProps {
  currentUserId: string;
  prayCard: PrayCardWithProfiles;
  eventOption: EventOption;
}

// TODO: 현재 TodayPray 에서의 PrayCard 를 위한 컴포넌트로 사용중, 이후 이름 수정 및 폴더링 예정
const PrayCardUI: React.FC<PrayCardProps> = ({
  currentUserId,
  prayCard,
  eventOption,
}) => {
  const { prayDataHash, fetchPrayDataByUserId } = useBaseStore((state) => ({
    prayDataHash: state.prayDataHash,
    fetchPrayDataByUserId: state.fetchPrayDataByUserId,
  }));

  // TODO: 제거 예정. PrayCard.pray 로 사용 예정
  useEffect(() => {
    if (prayCard) {
      fetchPrayDataByUserId(prayCard.id, currentUserId);
    }
  }, [currentUserId, fetchPrayDataByUserId, prayCard]);

  if (!prayDataHash) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 min-h-[80vh] max-h-[80vh]">
      <div className="flex flex-col flex-grow min-h-full max-h-full bg-white rounded-2xl shadow-prayCard">
        <div className="flex flex-col justify-center items-start gap-1 bg-gradient-to-r from-start/60 via-middle/60 via-30% to-end/60 rounded-t-2xl p-5">
          <div className="flex items-center gap-2">
            <img
              src={prayCard.profiles.avatar_url || ""}
              className="w-7 h-7 rounded-full"
            />
            <p className="text-white text-lg">{prayCard.profiles.full_name}</p>
          </div>
          <p className="text-sm text-white w-full text-left">
            시작일 : {prayCard.created_at.split("T")[0]}
          </p>
        </div>
        <div className="flex flex-col flex-grow min-h-full max-h-full items-start px-[10px] py-[10px] overflow-y-auto no-scrollbar">
          <Textarea
            className="flex-grow w-full p-2 rounded-md overflow-y-auto no-scrollbar text-black !opacity-100 !border-none !cursor-default"
            value={prayCard.content || ""}
            disabled={true}
          />
        </div>
      </div>
      <ReactionWithCalendar prayCard={prayCard} eventOption={eventOption} />
    </div>
  );
};

export default PrayCardUI;
