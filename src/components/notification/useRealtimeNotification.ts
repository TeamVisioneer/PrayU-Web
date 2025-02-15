import { useEffect } from "react";
import { supabase } from "../../../supabase/client";
import { Notification } from "../../../supabase/types/tables";

const useRealtimeNotification = (
  userId: string,
  onNotificationReceived: (notification: Notification) => void,
) => {
  useEffect(() => {
    const channel = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onNotificationReceived(payload.new as Notification);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onNotificationReceived]);
};

export default useRealtimeNotification;
