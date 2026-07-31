import { NoticeDraft, parseNoticeDraft } from "@/lib/noticeDraft";

/**
 * 레포에 커밋한 공지 원고(`docs/notices/<slug>.md`)를 어드민이 직접 읽는다.
 *
 * 손으로 옮겨 적는 단계를 없애기 위한 것이다 — 같은 원고를 staging·prod 에 각각
 * 붙여넣다 보면 언젠가 어긋난다. 어드민은 이 목록에서 골라 초안으로 등록한다.
 * (docs/guides/notice-authoring-plan.md)
 *
 * lazy glob 이라 본문은 번들에 실리지 않고, 목록을 열 때 따로 받아온다.
 * `.notes.md`(작업 메모)는 원고가 아니므로 제외한다.
 */
const modules = import.meta.glob("../../docs/notices/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

export interface NoticeDraftFile {
  /** 파일명에서 딴 식별자. notice.slug 로 저장돼 "이미 등록됨"을 판단한다 */
  slug: string;
  draft: NoticeDraft;
  /** 원고에서 읽지 못한 항목 — 등록 전에 보여준다 */
  warnings: string[];
}

const toSlug = (path: string): string =>
  path.replace(/^.*\/(.+)\.md$/, "$1");

/** 원고 전부를 읽어 파싱한다. 최신 파일이 앞에 오도록 정렬한다 */
export const loadNoticeDrafts = async (): Promise<NoticeDraftFile[]> => {
  const entries = Object.entries(modules).filter(
    ([path]) => !path.endsWith(".notes.md"),
  );

  const files = await Promise.all(
    entries.map(async ([path, load]) => {
      const raw = await load();
      const { draft, warnings } = parseNoticeDraft(raw);
      return { slug: toSlug(path), draft, warnings };
    }),
  );

  return files.sort((a, b) => b.slug.localeCompare(a.slug));
};
