/**
 * 성경 본문 표시용 정리.
 *
 * DB(`public.bible`)는 원본(goodtvbible.goodtv.co.kr)을 **그대로 보존**한다.
 * 따라서 본문에 다음 두 표기가 섞여 있다:
 *   - `<구역 제목>` — 구역이 시작되는 절의 맨 앞
 *   - `○` — 문단 시작 표시. 절 맨 앞이 대부분이나 절 중간에도 온다(30개 절)
 *
 * 본문을 훼손하지 않으려고 DB에 남긴 것이므로, 사용자에게 보여줄 때 걷어내는 것은 프론트 몫이다.
 * (PrayU-Api `docs/archive/bible-sync-plan.md`)
 */
export const stripBibleMarkers = (sentence: string): string =>
  sentence
    .replace(/<[^>]*>/g, "")
    .replace(/○/g, "")
    .replace(/\s+/g, " ")
    .trim();
