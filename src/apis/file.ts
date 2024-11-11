import { supabase } from "./../../supabase/client";
import * as Sentry from "@sentry/react";

export const uploadImage = async (file: File, path: string) => {
  try {
    const { data, error } = await supabase
      .storage
      .from("prayu")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
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

export const getPublicUrl = (path: string) => {
  try {
    const { data } = supabase.storage
      .from("prayu")
      .getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};
