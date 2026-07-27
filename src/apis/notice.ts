import { supabase } from "./../../supabase/client";
import { Notice, NoticeSlide } from "../../supabase/types/tables";
import { TablesInsert, TablesUpdate } from "../../supabase/types/database";
import * as Sentry from "@sentry/react";

// slides(jsonb)를 앱 타입으로 좁힌다 — 잘못된 형태가 저장돼 있어도 렌더가 깨지지 않도록 방어
export const parseNoticeSlides = (slides: Notice["slides"]): NoticeSlide[] => {
  if (!Array.isArray(slides)) return [];
  return slides.filter(
    (slide) =>
      typeof slide === "object" && slide !== null && !Array.isArray(slide),
  ) as NoticeSlide[];
};

/**
 * 현재 노출할 공지 1건.
 * RLS가 활성·기간 조건을 강제하므로 여기서는 최신 1건만 고른다.
 * (노출 여부 최종 판단 — 이미 본 공지·대상 필터 — 은 NoticeDialog가 담당)
 */
export const fetchActiveNotice = async (): Promise<Notice | null> => {
  try {
    const { data, error } = await supabase
      .from("notice")
      .select("*")
      .eq("is_active", true)
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
