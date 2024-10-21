import * as Sentry from "@sentry/react";
import { supabase } from "../../supabase/client";
import { Notification } from "../../supabase/types/tables";
import { NotificationType } from "@/components/notification/NotificationType";

export const fetchUserNotificationListByGroupId = async (
  userId: string,
  groupId: string,
  unreadOnly: boolean = false,
  limit: number = 10,
  offset: number = 0,
): Promise<Notification[]> => {
  try {
    let query = supabase
      .from("notification")
      .select("*")
      .or(`group_id.eq.${groupId},group_id.is.null`)
      .eq("user_id", userId)
      .is("deleted_at", null);
    if (unreadOnly) query = query.is("checked_at", null);

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      Sentry.captureException(error.message);
      return [];
    }
    return data as Notification[];
  } catch (error) {
    Sentry.captureException(error);
    return [];
  }
};

export const fetchNotificationCount = async (
  userId: string,
  groupId: string,
  unreadOnly: boolean = false,
): Promise<number> => {
  try {
    let query = supabase
      .from("notification")
      .select("*")
      .or(`group_id.eq.${groupId},group_id.is.null`)
      .eq("user_id", userId)
      .is("deleted_at", null);

    if (unreadOnly) query = query.is("checked_at", null);
    const { data, error } = await query;

    if (error) {
      Sentry.captureException(error.message);
      return 0;
    }
    return data?.length || 0;
  } catch (error) {
    Sentry.captureException(error);
    return 0;
  }
};

export interface createNotificationParams {
  groupId?: string;
  userId: string[];
  senderId?: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: { [key: string]: string };
}

export const createNotification = async (
  params: createNotificationParams,
): Promise<Notification | null> => {
  try {
    const { error, data: result } = await supabase
      .from("notification")
      .insert(
        params.userId.map((userId) => ({
          group_id: params.groupId || null,
          user_id: userId,
          sender_id: params.senderId || null,
          title: params.title,
          body: params.body,
          type: params.type,
          data: params.data || {},
        })),
      )
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
