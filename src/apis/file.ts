import { supabase } from "./../../supabase/client";
import * as Sentry from "@sentry/react";
import { isAssetStorageConfigured } from "@/lib/assetUrl";

/**
 * 이미지 업로드.
 *
 * 새 스토리지(R2)에는 RLS 가 없어 브라우저가 직접 올릴 수 없다. 서버(`POST /api/upload-url`)가
 * "이 키에, 이 타입으로, 5분 안에만" 서명한 URL 을 내주고 브라우저는 거기에 본문만 PUT 한다.
 * 저장하는 값은 절대 URL 이 아니라 **키**다 (PrayU-Api/docs/storage-r2-plan.md).
 *
 * R2 환경변수(`VITE_STORAGE_BASE_URL`)가 없으면 **기존 Supabase Storage 경로 그대로** 동작한다.
 */

/** 업로드 용도. 경로는 이 값으로 **서버가** 정한다 — 클라이언트가 경로를 만들지 않는다 */
export type UploadKind = "bible_card" | "thanks_card" | "notice";

export interface UploadedImage {
  /** 새 스토리지 경로. DB 의 `image_key` 에 넣는다 */
  key: string | null;
  /** 레거시 Supabase 업로드일 때만 채워진다. 기존 URL 컬럼에 넣는다 */
  url: string | null;
}

/** 레거시 경로 규칙 — 기존에 쓰던 디렉터리를 그대로 유지한다 */
const LEGACY_DIRS: Record<UploadKind, string> = {
  bible_card: "BibleCard/UserBibleCard",
  thanks_card: "ThanksCard/UserImage",
  notice: "notice",
};

/**
 * `upsert: false` 라 같은 경로면 업로드가 실패한다.
 * 사용자가 고른 사진 이름이 겹칠 수 있으므로 시각을 붙여 유일하게 만든다.
 */
const legacyPath = (kind: UploadKind, file: File): string =>
  `${LEGACY_DIRS[kind]}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;

/** 서명 URL 발급 요청 */
const requestUploadUrl = async (
  kind: UploadKind,
  contentType: string,
): Promise<{ url: string; key: string } | null> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(
    `${import.meta.env.VITE_SUPA_PROJECT_URL}/functions/v1/api/upload-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ kind, contentType }),
    },
  );

  const { data, error } = await response.json();
  if (error || !data?.url || !data?.key) {
    Sentry.captureException(
      `upload-url 발급 실패 (${response.status}): ${error ?? "unknown"}`,
    );
    return null;
  }
  return data;
};

const uploadToSupabase = async (
  file: File,
  kind: UploadKind,
): Promise<UploadedImage | null> => {
  const { data, error } = await supabase.storage
    .from("prayu")
    .upload(legacyPath(kind, file), file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    Sentry.captureException(error.message);
    return null;
  }

  const { data: publicData } = supabase.storage
    .from("prayu")
    .getPublicUrl(data.path);
  return { key: null, url: publicData.publicUrl };
};

/**
 * 파일을 올리고 **저장할 값**을 돌려준다.
 *
 * 실패하면 `null`. 이미지 없이 진행할지 중단할지는 호출부가 정한다.
 */
export const uploadImage = async (
  file: File,
  kind: UploadKind,
): Promise<UploadedImage | null> => {
  try {
    if (!isAssetStorageConfigured()) return await uploadToSupabase(file, kind);

    const issued = await requestUploadUrl(kind, file.type);
    if (!issued) return null;

    // 서명에 content-type 이 묶여 있다 — 헤더가 다르면 스토리지가 403 을 준다
    const response = await fetch(issued.url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!response.ok) {
      Sentry.captureException(
        `스토리지 업로드 실패 (${response.status}): ${issued.key}`,
      );
      return null;
    }

    return { key: issued.key, url: null };
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};
