import { useEffect, useRef, useState } from "react";
import { BIBLE_BOOKS, BibleBook } from "@/data/bibleStructure";

export interface BibleVerseSelection {
  book: BibleBook;
  chapter: number;
  startParagraph: number;
  endParagraph: number;
}

interface BibleVersePickerProps {
  value: BibleVerseSelection;
  onChange: (selection: BibleVerseSelection) => void;
  disabled?: boolean;
}

// 시편은 "편", 나머지는 "장" (기존 createBibleReference 관례와 동일)
const chapterUnit = (book: BibleBook) => (book.longLabel === "시편" ? "편" : "장");

const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

// 초성 인덱스 바 — 성경앱 관례의 대표 책 앵커 (창세기/여호수아/욥기/이사야/호세아/마태/사도행전/로마서/히브리서)
const INDEX_ANCHORS = [
  { label: "창", book: 1 },
  { label: "수", book: 6 },
  { label: "욥", book: 18 },
  { label: "사", book: 23 },
  { label: "호", book: 28 },
  { label: "마", book: 40 },
  { label: "행", book: 44 },
  { label: "롬", book: 45 },
  { label: "히", book: 58 },
];

const PICKER_HEIGHT = 336;

const BibleVersePicker = ({
  value,
  onChange,
  disabled,
}: BibleVersePickerProps) => {
  const { book, chapter, startParagraph, endParagraph } = value;
  const chapterCount = book.verseCounts.length;
  const verseCount = book.verseCounts[chapter - 1];

  // 사용자가 시작 절을 명시적으로 탭하기 전(책/장 변경 직후 기본값 1절 상태)에는
  // 확장 규칙을 발동하지 않는다 — 첫 탭은 항상 "새 시작"
  const [hasUserSetStart, setHasUserSetStart] = useState(false);
  useEffect(() => {
    setHasUserSetStart(false);
  }, [book.book, chapter]);

  // 범위 상한은 장 전체 — 장이 자연스러운 묵상 단위이자 상한
  const isRangeSet = endParagraph > startParagraph;
  const canExtend = hasUserSetStart && !isRangeSet;

  const bookColRef = useRef<HTMLDivElement>(null);
  const chapterColRef = useRef<HTMLDivElement>(null);
  const verseColRef = useRef<HTMLDivElement>(null);
  const bookItemRefs = useRef(new Map<number, HTMLButtonElement>());
  const chapterItemRefs = useRef(new Map<number, HTMLButtonElement>());

  const centerInColumn = (
    col: HTMLDivElement | null,
    item: HTMLButtonElement | undefined,
  ) => {
    if (!col || !item) return;
    col.scrollTo({
      top: item.offsetTop - col.clientHeight / 2 + item.clientHeight / 2,
    });
  };

  useEffect(() => {
    centerInColumn(bookColRef.current, bookItemRefs.current.get(book.book));
  }, [book.book]);

  useEffect(() => {
    centerInColumn(chapterColRef.current, chapterItemRefs.current.get(chapter));
  }, [book.book, chapter]);

  useEffect(() => {
    // 책/장이 바뀌면 절 목록은 처음부터 (탭할 때마다 스크롤을 건드리지 않는다)
    verseColRef.current?.scrollTo({ top: 0 });
  }, [book.book, chapter]);

  const handleBookTap = (nextBook: BibleBook) => {
    if (nextBook.book === book.book) return;
    onChange({ book: nextBook, chapter: 1, startParagraph: 1, endParagraph: 1 });
  };

  const handleChapterTap = (nextChapter: number) => {
    if (nextChapter === chapter) return;
    onChange({ book, chapter: nextChapter, startParagraph: 1, endParagraph: 1 });
  };

  const handleVerseTap = (v: number) => {
    if (canExtend && v > startParagraph) {
      // 시작 절 탭 이후 더 큰 절 탭 → 끝 절로 확장
      onChange({ book, chapter, startParagraph, endParagraph: v });
    } else {
      // 그 외에는 새 시작 절
      setHasUserSetStart(true);
      onChange({ book, chapter, startParagraph: v, endParagraph: v });
    }
  };

  // "끝절까지" — 현재 시작 절부터 장의 마지막 절까지
  const handleSelectToEnd = () => {
    setHasUserSetStart(true);
    onChange({ book, chapter, startParagraph, endParagraph: verseCount });
  };

  const scrollToAnchor = (bookNum: number) => {
    const col = bookColRef.current;
    const item = bookItemRefs.current.get(bookNum);
    if (!col || !item) return;
    col.scrollTo({ top: item.offsetTop - 28 }); // sticky 헤더 높이만큼 여유
  };

  const groupHeaderClass =
    "sticky top-0 z-10 bg-gray-50 px-3 py-1 text-[11px] font-medium text-gray-400";
  const rowBase =
    "flex w-full items-center px-3 py-2.5 text-left text-sm transition-colors disabled:opacity-40";
  const selectedRow = "bg-blue-50 font-semibold text-blue-700";

  const renderBookGroup = (testament: "구" | "신", label: string) => (
    <>
      <div className={groupHeaderClass}>{label}</div>
      {BIBLE_BOOKS.filter((b) => b.testament === testament).map((b) => (
        <button
          key={b.book}
          type="button"
          ref={(el) => {
            if (el) bookItemRefs.current.set(b.book, el);
          }}
          onClick={() => handleBookTap(b)}
          disabled={disabled}
          className={`${rowBase} gap-2 ${
            b.book === book.book ? selectedRow : "text-gray-700"
          }`}
        >
          <span className="w-7 shrink-0 text-[11px] font-semibold text-blue-400">
            {b.shortLabel}
          </span>
          <span className="truncate">{b.longLabel}</span>
        </button>
      ))}
    </>
  );

  return (
    <div
      className="flex overflow-hidden rounded-2xl bg-white shadow-sm"
      style={{ height: PICKER_HEIGHT }}
    >
      {/* 책 열 */}
      <div
        ref={bookColRef}
        className="relative flex-[1.5] overflow-y-auto border-r border-gray-100"
      >
        {renderBookGroup("구", "구약")}
        {renderBookGroup("신", "신약")}
      </div>

      {/* 초성 인덱스 바 */}
      <div className="flex w-7 shrink-0 flex-col items-center justify-center gap-0.5 border-r border-gray-100 bg-gray-50/60">
        {INDEX_ANCHORS.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => scrollToAnchor(a.book)}
            disabled={disabled}
            className="px-1 py-0.5 text-[11px] font-medium text-accentFrom"
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* 장 열 */}
      <div
        ref={chapterColRef}
        className="relative flex-1 overflow-y-auto border-r border-gray-100"
      >
        {range(1, chapterCount).map((c) => (
          <button
            key={c}
            type="button"
            ref={(el) => {
              if (el) chapterItemRefs.current.set(c, el);
            }}
            onClick={() => handleChapterTap(c)}
            disabled={disabled}
            className={`${rowBase} justify-center ${
              c === chapter ? selectedRow : "text-gray-700"
            }`}
          >
            {c}
            {chapterUnit(book)}
          </button>
        ))}
      </div>

      {/* 절 열 — 첫 탭 = 시작, 더 큰 절 탭 = 끝 확장, 다시 탭 = 새 시작 */}
      <div ref={verseColRef} className="relative flex-1 overflow-y-auto">
        <div
          className={`${groupHeaderClass} flex items-center justify-between gap-1`}
        >
          <span>{hasUserSetStart ? "~ 끝 절" : "시작 절"}</span>
          <button
            type="button"
            onClick={handleSelectToEnd}
            disabled={disabled || endParagraph === verseCount}
            className="whitespace-nowrap rounded-md bg-blue-50 px-1.5 py-0.5 font-medium text-accentTo disabled:opacity-40"
          >
            끝까지
          </button>
        </div>
        {range(1, verseCount).map((v) => {
          const inRange = v >= startParagraph && v <= endParagraph;
          return (
            <button
              key={v}
              type="button"
              onClick={() => handleVerseTap(v)}
              disabled={disabled}
              className={`${rowBase} justify-center ${
                inRange ? selectedRow : "text-gray-700"
              }`}
            >
              {v}절
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BibleVersePicker;
