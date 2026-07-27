import { supabase } from "./../../supabase/client";
import { Notice } from "../../supabase/types/tables";
import { TablesInsert, TablesUpdate } from "../../supabase/types/database";
import * as Sentry from "@sentry/react";

// images(jsonb)를 URL 배열로 좁힌다 — 잘못된 값이 섞여 있어도 렌더가 깨지지 않도록 방어
export const parseNoticeImages = (images: Notice["images"]): string[] => {
  if (!Array.isArray(images)) return [];
  return images.filter(
    (url): url is string => typeof url === "string" && url.length > 0,
  );
};

/**
 * 현재 노출할 공지 1건.
 * 노출 조건(활성·기간)은 앱이 판단한다 — DB는 로그인 사용자에게 공지를 열어둘 뿐이다.
 * 남은 판단(이미 본 공지·대상 필터)은 NoticeDialog가 이어서 한다.
 */
export const fetchActiveNotice = async (): Promise<Notice | null> => {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("notice")
      .select("*")
      .eq("is_active", true)
      .lte("starts_at", now)
      .or(`ends_at.is.null,ends_at.gt.${now}`)
      .order("starts_at", { ascending: false })
      .limit(1)
      .maybeSingle();

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

/** 알림함에서 공지 알림을 눌렀을 때 — 기간이 지난 공지는 RLS에 막혀 null */
export const fetchNoticeById = async (
  noticeId: string,
): Promise<Notice | null> => {
  try {
    const { data, error } = await supabase
      .from("notice")
      .select("*")
      .eq("id", noticeId)
      .maybeSingle();

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

/** 어드민 전용 — 비활성·예약 공지까지 전부 (RLS의 admin 정책으로 허용됨) */
export const fetchNoticeList = async (): Promise<Notice[] | null> => {
  try {
    const { data, error } = await supabase
      .from("notice")
      .select("*")
      .order("created_at", { ascending: false });

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

export const createNotice = async (
  notice: TablesInsert<"notice">,
): Promise<Notice | null> => {
  try {
    const { data, error } = await supabase
      .from("notice")
      .insert(notice)
      .select()
      .single();

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

export const updateNotice = async (
  noticeId: string,
  notice: TablesUpdate<"notice">,
): Promise<Notice | null> => {
  try {
    const { data, error } = await supabase
      .from("notice")
      .update({ ...notice, updated_at: new Date().toISOString() })
      .eq("id", noticeId)
      .select()
      .single();

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
