import * as Sentry from "@sentry/react";
import { supabase } from "../../supabase/client";
import { getISOToday } from "@/lib/utils";

export const updateUserMetaData = async (params: { [key: string]: string }) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: params,
    });
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

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    // member soft delete
    const { error } = await supabase
      .from("member")
      .update({ deleted_at: getISOToday() })
      .eq("user_id", userId);

    if (error) {
      Sentry.captureException(error.message);
      return false;
    }
  } catch (error) {
    Sentry.captureException(error);
    return false;
  }

  try {
    // pray soft delete
    const { error } = await supabase
      .from("pray")
      .update({ deleted_at: getISOToday() })
      .eq("user_id", userId);

    if (error) {
      Sentry.captureException(error.message);
      return false;
    }
  } catch (error) {
    Sentry.captureException(error);
    return false;
  }

  try {
    // prayCard soft delete
    const { error } = await supabase
      .from("pray_card")
      .update({ deleted_at: getISOToday() })
      .eq("user_id", userId);

    if (error) {
      Sentry.captureException(error.message);
      return false;
    }
  } catch (error) {
    Sentry.captureException(error);
    return false;
  }

  try {
    const { error } = await supabase
      .from("profiles")
      .update({ terms_agreed_at: null })
      .eq("id", userId);

    if (error) {
      Sentry.captureException(error.message);
      return false;
    }
  } catch (error) {
    Sentry.captureException(error);
    return false;
  }

  try {
    // user hard delete
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(
      `${import.meta.env.VITE_SUPA_PROJECT_URL}/functions/v1/api/users`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${session?.access_token}`,
        },
      },
    );

    const { error } = await response.json();
    if (error) {
      Sentry.captureException(error.message);
      return false;
    }
  } catch (error) {
    Sentry.captureException(error);
    return false;
  }
  return true;
};
