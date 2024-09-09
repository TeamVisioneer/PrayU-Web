import { Profiles } from "supabase/types/tables";
import { supabase } from "../../supabase/client";
import * as Sentry from "@sentry/react";

export interface updateProfilesParams {
  avatar_url?: string;
  blocking_users?: string[];
  full_name?: string;
  kakao_id?: string;
  updated_at?: string;
  username?: string;
  website?: string;
}

export const updateProfile = async (
  userId: string,
  params: updateProfilesParams
) => {
  try {
    const { error, data } = await supabase
      .from("profiles")
      .update(params)
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
