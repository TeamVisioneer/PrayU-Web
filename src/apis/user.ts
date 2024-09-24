import * as Sentry from "@sentry/react";
import { supabase } from "../../supabase/client";
import { getISOToday } from "@/lib/utils";

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
    // user hard delete
    const response = await fetch(
      `${import.meta.env.VITE_SUPA_PROJECT_URL}/functions/v1/delete-user`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPA_ANON_KEY,
          authorization: `Bearer ${import.meta.env.VITE_SUPA_ANON_KEY}`,
        },
        body: JSON.stringify({ userId }), // userId를 body에 포함시킴
      }
    );

    if (!response.ok) {
      return false;
    }

    const { error } = await response.json();
    if (error) {
      Sentry.captureException(error.message);
      return false;
    }
    return true;
  } catch (error) {
    Sentry.captureException(error);
    return false;
  }
};
