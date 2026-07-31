/**
 * 스토리지 키 → 공개 URL.
 *
 * DB 에는 절대 URL 이 아니라 **경로(key)** 만 저장한다. 스토리지 도메인이 데이터에 박히면
 * 도메인을 바꿀 때 수만 행을 일괄 수정해야 하기 때문이다 (PrayU-Api/docs/archive/storage-r2-plan.md).
 * 그 대가로 읽는 쪽에서 매번 한 번 조립한다.
 */

const BASE = (import.meta.env.VITE_STORAGE_BASE_URL ?? "").replace(/\/+$/, "");

/**
 * 새 스토리지(R2)를 쓸 수 있는 환경인지.
 *
 * 이 값이 없으면 업로드는 **기존 Supabase Storage 로** 나간다.
 * R2 준비(버킷·토큰·CORS·시크릿)는 사람이 하는 단계라, 환경변수 하나로 켜고 끌 수 있게 둔다.
 */
export const isAssetStorageConfigured = (): boolean => BASE !== "";

/**
 * 키를 공개 URL 로 바꾼다.
 *
 * **키만 받는다.** 절대 URL 을 넘기면 그대로 통과시키는 식으로 만들지 않는다 —
 * 값 모양으로 분기하면 나중에 다른 형태가 섞였을 때 조용히 틀린 URL 을 만든다.
 * 키가 없거나 base URL 이 없으면 `null` 이고, 호출부는 기존 컬럼으로 폴백한다.
 */
export const assetUrl = (key: string | null | undefined): string | null => {
  if (!key || !BASE) return null;
  return `${BASE}/${key.replace(/^\/+/, "")}`;
};
