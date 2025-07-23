import { useEffect } from "react";
import { supabase } from "../../../supabase/client";
import { ThanksCard } from "../../../supabase/types/tables";

/**
 * 실시간으로 감사카드 변경사항을 감지하는 훅
 * @param onThanksCardAdded 새로운 감사카드가 추가되었을 때 호출되는 콜백
 */
const useRealtimeThanksCard = (
  onThanksCardAdded: (thanksCard: ThanksCard) => Promise<void>,
) => {
  useEffect(() => {
    const channel = supabase
      .channel("thanks-card-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "thanks_card",
        },
        (payload) => {
          // 새로 추가된 감사카드가 삭제되지 않은 상태인 경우에만 처리
          const newThanksCard = payload.new as ThanksCard;
          if (!newThanksCard.deleted_at) {
            onThanksCardAdded(newThanksCard);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onThanksCardAdded]);
};

export default useRealtimeThanksCard;
