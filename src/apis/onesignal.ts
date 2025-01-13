import * as Sentry from "@sentry/react";
import { supabase } from "../../supabase/client";

export interface CreateOnesignalPushParams {
  title: string;
  subtitle: string;
  message: string;
  data: { url: string };
  userIds: string[];
}

export interface OnesignalPushResponse {
  id: string;
  external_id: string;
  warnings: unknown;
}

export const createOnesignalPush = async (
  params: CreateOnesignalPushParams,
): Promise<OnesignalPushResponse | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPA_PROJECT_URL}/functions/v1/onesignal/notifications`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(params),
      },
    );
    const { data, error } = await response.json();
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data as OnesignalPushResponse;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};
