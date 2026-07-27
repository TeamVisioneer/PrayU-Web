import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  maxRange: number; // 한 번에 선택 가능한 최대 절 수
  disabled?: boolean;
}

// 시편은 "편", 나머지는 "장" (기존 createBibleReference 관례와 동일)
const chapterUnit = (book: BibleBook) => (book.longLabel === "시편" ? "편" : "장");

const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

const BibleVersePicker = ({
  value,
  onChange,
  maxRange,
  disabled,
}: BibleVersePickerProps) => {
  const { book, chapter, startParagraph, endParagraph } = value;
  const chapterCount = book.verseCounts.length;
  const verseCount = book.verseCounts[chapter - 1];

  const handleBookChange = (bookNum: string) => {
    const nextBook = BIBLE_BOOKS.find((b) => b.book === Number(bookNum));
    if (!nextBook) return;
    // 책이 바뀌면 장/절은 처음으로
    onChange({ book: nextBook, chapter: 1, startParagraph: 1, endParagraph: 1 });
  };

  const handleChapterChange = (chapterStr: string) => {
    onChange({
      book,
      chapter: Number(chapterStr),
      startParagraph: 1,
      endParagraph: 1,
    });
  };

  const handleStartChange = (startStr: string) => {
    const start = Number(startStr);
    // 끝 절은 시작 절 이후로 클램프 (범위 상한 유지)
    const end = Math.min(
      Math.max(endParagraph, start),
      start + maxRange - 1,
      verseCount,
    );
    onChange({ book, chapter, startParagraph: start, endParagraph: end });
  };

  const handleEndChange = (endStr: string) => {
    onChange({ book, chapter, startParagraph, endParagraph: Number(endStr) });
  };

  const rowClass = "flex items-center justify-between gap-3";
  const labelClass = "w-14 shrink-0 text-sm font-medium text-gray-600";

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className={rowClass}>
        <span className={labelClass}>성경책</span>
        <Select
          value={String(book.book)}
          onValueChange={handleBookChange}
          disabled={disabled}
        >
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectGroup>
              <SelectLabel>구약</SelectLabel>
              {BIBLE_BOOKS.filter((b) => b.testament === "구").map((b) => (
                <SelectItem key={b.book} value={String(b.book)}>
                  {b.longLabel}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>신약</SelectLabel>
              {BIBLE_BOOKS.filter((b) => b.testament === "신").map((b) => (
                <SelectItem key={b.book} value={String(b.book)}>
                  {b.longLabel}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>{chapterUnit(book)}</span>
        <Select
          value={String(chapter)}
          onValueChange={handleChapterChange}
          disabled={disabled}
        >
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {range(1, chapterCount).map((c) => (
              <SelectItem key={c} value={String(c)}>
                {c}
                {chapterUnit(book)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>절</span>
        <div className="flex flex-1 items-center gap-2">
          <Select
            value={String(startParagraph)}
            onValueChange={handleStartChange}
            disabled={disabled}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {range(1, verseCount).map((v) => (
                <SelectItem key={v} value={String(v)}>
                  {v}절
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-400">~</span>
          <Select
            value={String(endParagraph)}
            onValueChange={handleEndChange}
            disabled={disabled}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {range(
                startParagraph,
                Math.min(startParagraph + maxRange - 1, verseCount),
              ).map((v) => (
                <SelectItem key={v} value={String(v)}>
                  {v}절
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default BibleVersePicker;
