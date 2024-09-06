import { supabase } from "../../supabase/client";
import * as Sentry from "@sentry/react";

export const updateProfile = async (userId: string, kakaoId: string) => {
  try {
    const { error, data } = await supabase
      .from("profiles")
      .update({
        kakao_id: kakaoId,
      })
      .eq("id", userId)
      .select();
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data ? data[0] : null;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};
