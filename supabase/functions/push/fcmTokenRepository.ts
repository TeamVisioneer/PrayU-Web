import { supabase } from "../serverClient.ts";

export class FCMTokenRepository {
  async fetchFCMTokenByUserId(userId: string) {
    try {
      const { data, error } = await supabase
        .from("fcm_token")
        .select("token")
        .eq("user_id", userId);
      if (error) {
        console.error("Error fetching FCM tokens:", error.message);
        return null;
      }
      return data;
    } catch (error) {
      console.error("Error fetching FCM tokens:", error.message);
      return null;
    }
  }
}
