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
      .or(`group_id.eq.${groupId},group_id.is.null`)
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

export interface createNotificationParams {
  groupId?: string;
  userId: string;
  senderId?: string;
  title: string;
  body: string;
  type: string;
  data?: { [key: string]: string };
}

export const createNotification = async (
  params: createNotificationParams,
): Promise<Notification | null> => {
  try {
    const { error, data: result } = await supabase
      .from("notification")
      .insert([{
        group_id: params.groupId,
        user_id: params.userId,
        sender_id: params.senderId,
        title: params.title,
        body: params.body,
        type: params.type,
        data: params.data || {},
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
