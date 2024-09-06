import { Profiles } from "supabase/types/tables";
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

export const fetchProfilesByUserId = async (
  userId: string
): Promise<Profiles[] | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(`*`)
      .eq("id", userId);
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const updateProfileName = async (userId: string, userName: string) => {
  try {
    const { error, data } = await supabase
      .from("profiles")
      .update({
        full_name: userName,
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
