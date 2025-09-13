import { Profiles } from "supabase/types/tables";
import { supabase } from "../../supabase/client";
import * as Sentry from "@sentry/react";
import { Json } from "supabase/types/database";

export interface updateProfilesParams {
  avatar_url?: string;
  blocking_users?: string[];
  full_name?: string;
  kakao_id?: string;
  updated_at?: string;
  username?: string;
  website?: string;
  kakao_notification?: boolean;
  push_notification?: boolean;
  terms_agreed_at?: string;
  fcm_token?: string;
  premium_expired_at?: string | null;
  app_settings?: Json;
}

export const updateProfile = async (
  userId: string,
  params: updateProfilesParams,
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

export const getProfile = async (userId: string): Promise<Profiles | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(`*`)
      .eq("id", userId)
      .single();
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data as Profiles;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const fetchProfileList = async (
  userIds: string[],
): Promise<Profiles[] | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(`*`)
      .in("id", userIds);
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

export const fetchProfileListByUserName = async (
  userName: string,
  limit: number,
): Promise<Profiles[] | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .like("full_name", `%${userName}%`)
      .limit(limit);
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

export const fetchProfileListByStartId = async (
  startId: string,
  limit: number,
): Promise<string[] | null> => {
  try {
    const query = supabase
      .from("profiles")
      .select("id");

    if (startId) query.gt("id", startId);

    const { data, error } = await query
      .limit(limit)
      .order("id", { ascending: true });
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data ? data.map((profile) => profile.id) : null;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const fetchProfileCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });
    if (error) {
      Sentry.captureException(error.message);
      return 0;
    }
    return count ? count : 0;
  } catch (error) {
    Sentry.captureException(error);
    return 0;
  }
};

export const fetchNewUserCount = async (todayDate: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayDate);
    if (error) {
      Sentry.captureException(error.message);
      return 0;
    }
    return count ? count : 0;
  } catch (error) {
    Sentry.captureException(error);
    return 0;
  }
};
