// 로컬 스택의 bible 테이블에서 성경 구조(책/장/절수)를 추출해 src/data/bibleStructure.ts 를 생성한다.
// 실행: node scripts/generate-bible-structure.mjs  (로컬 스택이 떠 있어야 함 — PrayU-Api ./scripts/dev.sh)
// bible 데이터는 사실상 불변이므로 산출물을 커밋해 사용하고, 데이터가 바뀔 때만 재실행한다.
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";

// supabase local 공통 데모 키 (공개값 — 시크릿 아님)
const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const PAGE_SIZE = 1000;
const rows = [];
for (let from = 0; ; from += PAGE_SIZE) {
  const { data, error } = await supabase
    .from("bible")
    .select("book, long_label, short_label, testament, chapter, paragraph")
    .order("id", { ascending: true })
    .range(from, from + PAGE_SIZE - 1);
  if (error) throw new Error(error.message);
  rows.push(...data);
  if (data.length < PAGE_SIZE) break;
}

// book 번호 기준으로 장별 최대 절 번호 집계
const books = new Map();
for (const r of rows) {
  if (!books.has(r.book)) {
    books.set(r.book, {
      book: r.book,
      longLabel: r.long_label,
      shortLabel: r.short_label,
      testament: r.testament,
      chapters: new Map(),
    });
  }
  const b = books.get(r.book);
  b.chapters.set(r.chapter, Math.max(b.chapters.get(r.chapter) ?? 0, r.paragraph));
}

const sorted = [...books.values()].sort((a, b) => a.book - b.book);
const entries = sorted.map((b) => {
  const chapterNums = [...b.chapters.keys()].sort((x, y) => x - y);
  const verseCounts = chapterNums.map((c) => b.chapters.get(c));
  return `  { book: ${b.book}, longLabel: ${JSON.stringify(b.longLabel)}, shortLabel: ${JSON.stringify(b.shortLabel)}, testament: ${JSON.stringify(b.testament)}, verseCounts: [${verseCounts.join(", ")}] },`;
});

const out = `// 생성 파일 — 직접 수정 금지. 재생성: node scripts/generate-bible-structure.mjs
// 원본: bible 테이블 (개역). 66권, 각 장의 절 수는 DB와 정확히 일치한다.

export interface BibleBook {
  book: number;
  longLabel: string;
  shortLabel: string;
  testament: "구" | "신";
  /** index = 장 번호 - 1, 값 = 그 장의 절 수 */
  verseCounts: number[];
}

export const BIBLE_BOOKS: BibleBook[] = [
${entries.join("\n")}
];
`;

writeFileSync(new URL("../src/data/bibleStructure.ts", import.meta.url), out);
console.log(`generated: ${sorted.length} books, ${rows.length} verses`);
