import { supabase } from "../serverClient.ts";

export class NotificationRepository {
  async updateNotification(
    id: string,
    params: { completed_at: string; fcm_result: { [key: string]: string[] } },
  ) {
    try {
      await supabase
        .from("notification")
        .update(params)
        .eq("id", id);
      return true;
    } catch (error) {
      console.error("Error updating notification:", error.message);
      return false;
    }
  }
}
