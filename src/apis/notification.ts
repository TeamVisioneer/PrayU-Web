import * as Sentry from "@sentry/react";
import { supabase } from "../../supabase/client";
import { Notification } from "../../supabase/types/tables";

export const fetchUserNotificationListByGroupId = async (
  userId: string,
  groupId: string,
  unreadOnly: boolean = false,
  limit: number = 10,
  offset: number = 0,
): Promise<{ notificationList: Notification[]; total: number }> => {
  try {
    let query = supabase
      .from("notification")
      .select("*", { count: "exact" })
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .is("deleted_at", null);
    if (unreadOnly) query = query.is("checked_at", null);

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      Sentry.captureException(error.message);
      return { notificationList: [], total: 0 };
    }
    return { notificationList: data as Notification[], total: count || 0 };
  } catch (error) {
    Sentry.captureException(error);
    return { notificationList: [], total: 0 };
  }
};

export const createNotification = async (
  groupId: string,
  userId: string,
  senderId: string,
  title: string,
  body: string,
  type: string,
  data: { key: string; value: string },
): Promise<Notification | null> => {
  try {
    const { error, data: result } = await supabase
      .from("notification")
      .insert([{
        group_id: groupId,
        user_id: userId,
        sender_id: senderId,
        title,
        body,
        type,
        data,
      }])
      .select();

    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return result?.[0] as Notification;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export interface updateNotificationParams {
  checked_at?: string | null;
  deleted_at?: string | null;
}

export const updateNotification = async (
  id: string,
  params: updateNotificationParams,
): Promise<Notification | null> => {
  try {
    const { error, data } = await supabase
      .from("notification")
      .update(params)
      .eq("id", id)
      .select();

    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data?.[0] as Notification;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};
