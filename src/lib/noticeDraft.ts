/**
 * 공지 원고(레포에 커밋한 마크다운) → 어드민 폼 값.
 *
 * 원고는 `PrayU-web/docs/notices/<yyyy-mm-dd>-<slug>.md` 에 두고 PR 에서 리뷰한다.
 * 형식은 프론트매터 + 마크다운 본문이다 — 본문이 JSON 문자열이 되면 PR diff 가
 * 이스케이프 투성이가 되어 정작 읽어야 할 문구가 안 읽히기 때문이다.
 * (docs/notice-authoring-plan.md)
 *
 * ```markdown
 * ---
 * title: 말씀카드가 더 편해졌어요
 * target: all
 * starts_at: 2026-08-01 09:00
 * images:
 *   - /images/notice/2026-08-01-bible-card/1.png
 * ---
 *
 * **공유하면 생성 횟수가 늘어나요**
 * ```
 *
 * JSON 도 받아들인다(`{` 로 시작하면). 다른 도구에서 복사해 오는 경우를 위한 것이며,
 * 레포 원고는 마크다운으로 둔다.
 */

export interface NoticeDraft {
  title?: string;
  body?: string;
  target?: "all" | "existing";
  startsAt?: string;
  endsAt?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  /** 없으면 폼의 기존 이미지를 유지한다 (Storage 업로드분을 지우지 않기 위해) */
  images?: string[];
}

export interface ParseResult {
  draft: NoticeDraft;
  /** 조용히 무시하지 않고 사용자에게 보여줄 문제들 */
  warnings: string[];
}

/** 문자열을 그대로 담는 필드 (target·images·body 는 따로 다룬다) */
type TextField = "title" | "startsAt" | "endsAt" | "ctaLabel" | "ctaUrl";

/** 프론트매터에서 받는 키 → 폼 필드 */
const KEY_MAP: Record<string, TextField | "target"> = {
  title: "title",
  target: "target",
  starts_at: "startsAt",
  ends_at: "endsAt",
  cta_label: "ctaLabel",
  cta_url: "ctaUrl",
};

/** 따옴표로 감싼 값이면 벗긴다 */
const unquote = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    if ((first === '"' || first === "'") && first === last) {
      return trimmed.slice(1, -1);
    }
  }
  return trimmed;
};

/**
 * `2026-08-01 09:00` / ISO 문자열 → datetime-local 입력값(YYYY-MM-DDTHH:mm).
 * 파싱할 수 없으면 null 을 돌려주고 호출부가 경고를 남긴다.
 */
const toLocalInputValue = (raw: string): string | null => {
  const value = raw.trim();
  if (!value) return "";
  // "YYYY-MM-DD HH:mm" 은 Safari 가 파싱하지 못해 T 로 바꿔준다
  const normalized = value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const applyScalar = (
  draft: NoticeDraft,
  warnings: string[],
  key: string,
  rawValue: string,
) => {
  const field = KEY_MAP[key];
  if (!field) {
    warnings.push(`모르는 항목이라 건너뜁니다: ${key}`);
    return;
  }
  const value = unquote(rawValue);
  if (!value) return;

  if (field === "target") {
    if (value !== "all" && value !== "existing") {
      warnings.push(`target 은 all 또는 existing 만 됩니다 (받은 값: ${value})`);
      return;
    }
    draft.target = value;
    return;
  }

  if (field === "startsAt" || field === "endsAt") {
    const converted = toLocalInputValue(value);
    if (converted === null) {
      warnings.push(`${key} 를 날짜로 읽지 못했습니다: ${value}`);
      return;
    }
    draft[field] = converted;
    return;
  }

  draft[field] = value;
};

const parseFrontmatter = (raw: string): ParseResult => {
  const warnings: string[] = [];
  const draft: NoticeDraft = {};

  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  // 첫 줄이 --- 이라는 전제(호출부에서 확인)
  const closing = lines.indexOf("---", 1);
  if (closing === -1) {
    return {
      draft: { body: raw.trim() },
      warnings: ["프론트매터가 --- 로 닫히지 않아 전체를 본문으로 읽었습니다"],
    };
  }

  let pendingListKey: string | null = null;
  const images: string[] = [];

  for (const line of lines.slice(1, closing)) {
    if (!line.trim()) continue;

    // 목록 항목 ("  - /images/...")
    if (/^\s*-\s+/.test(line)) {
      const item = unquote(line.replace(/^\s*-\s+/, ""));
      if (pendingListKey === "images") {
        if (item) images.push(item);
      } else {
        warnings.push(`목록 항목의 위치를 알 수 없어 건너뜁니다: ${item}`);
      }
      continue;
    }

    const separator = line.indexOf(":");
    if (separator === -1) {
      warnings.push(`형식을 알 수 없어 건너뜁니다: ${line.trim()}`);
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1);

    if (key === "images") {
      pendingListKey = "images";
      // 한 줄 배열도 허용: images: [a, b]
      const inline = value.trim();
      if (inline.startsWith("[")) {
        inline
          .replace(/^\[|\]$/g, "")
          .split(",")
          .map((item) => unquote(item))
          .filter(Boolean)
          .forEach((item) => images.push(item));
        pendingListKey = null;
      }
      continue;
    }

    pendingListKey = null;
    applyScalar(draft, warnings, key, value);
  }

  if (images.length > 0) draft.images = images;

  const body = lines
    .slice(closing + 1)
    .join("\n")
    .trim();
  if (body) draft.body = body;

  return { draft, warnings };
};

const parseJson = (raw: string): ParseResult => {
  const warnings: string[] = [];
  const draft: NoticeDraft = {};

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return { draft, warnings: ["JSON 을 읽지 못했습니다"] };
  }

  for (const [key, value] of Object.entries(parsed)) {
    if (key === "body") {
      if (typeof value === "string") draft.body = value;
      continue;
    }
    if (key === "images") {
      if (Array.isArray(value)) {
        draft.images = value.filter(
          (item): item is string => typeof item === "string",
        );
      } else {
        warnings.push("images 는 문자열 배열이어야 합니다");
      }
      continue;
    }
    if (value === null || value === undefined) continue;
    applyScalar(draft, warnings, key, String(value));
  }

  return { draft, warnings };
};

export const parseNoticeDraft = (raw: string): ParseResult => {
  const trimmed = raw.trim();
  if (!trimmed) return { draft: {}, warnings: ["내용이 비어 있습니다"] };

  const result = trimmed.startsWith("{")
    ? parseJson(trimmed)
    : trimmed.startsWith("---")
      ? parseFrontmatter(trimmed)
      : { draft: { body: trimmed }, warnings: [] as string[] };

  if (!result.draft.title) {
    result.warnings.push("제목(title)이 없어 기존 값을 유지합니다");
  }
  return result;
};
