import { useEffect } from "react";
import { supabase } from "../../../supabase/client";
import { Member } from "../../../supabase/types/tables";

const useRealtimeMember = (
  groupId: string | undefined,
  onMemberChanged: (member: Member) => Promise<void>,
) => {
  useEffect(() => {
    const channel = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "member",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          onMemberChanged(payload.new as Member);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, onMemberChanged]);
};

export default useRealtimeMember;
