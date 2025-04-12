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

export type OnesignalUpdateUserRequestBody = {
  properties?: {
    tags?: { [key: string]: string };
    language?: string;
    timezone_id?: string;
    lat?: number;
    long?: number;
    country?: string;
    first_active?: number;
    last_active?: number;
  };
  deltas?: {
    session_count?: number;
    purchases?: { sku: string; iso: string; amount: string; count: number }[];
    session_time?: number;
  };
};

export type OnesignalUpdateUserResponse = OnesignalUpdateUserRequestBody;

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

export const updateOnesignalUser = async (
  requestBody: OnesignalUpdateUserRequestBody,
): Promise<OnesignalUpdateUserResponse | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPA_PROJECT_URL}/functions/v1/onesignal/users`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(requestBody),
      },
    );
    return await response.json();
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};
