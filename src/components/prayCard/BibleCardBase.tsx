import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  BIBLE_CARD_HEIGHT,
  BIBLE_CARD_WIDTH,
  BibleCardContent,
  MAX_BIBLE_CARD_KEYWORDS,
  getBibleVerseStyle,
} from "@/constants/bibleCard";

// 말씀카드의 단일 디자인 원본. 화면 표시/썸네일은 ScaledBibleCard 로 축소 렌더링하고,
// 이미지 캡처는 BibleCardBase 를 원본 크기 그대로 찍는다. 같은 컴포넌트를 쓰므로
// 화면에 보이는 카드와 저장되는 이미지가 항상 일치한다.
export const BibleCardBase = ({ content }: { content: BibleCardContent }) => {
  const [primary = "#608CFF", secondary = "#AAC7FF"] = content.colors;
  const [
    borderTopLeftRadius = "80px",
    borderTopRightRadius = "120px",
    borderBottomRightRadius = "80px",
    borderBottomLeftRadius = "120px",
  ] = content.radius;
  const bibleSentence = content.bibleSentence.replace(/<[^>]*>/g, "").trim();
  const verseStyle = getBibleVerseStyle(bibleSentence.length);

  return (
    <div
      className="relative flex flex-col border border-gray-200 bg-[#FEFDFC] px-[30px] py-[20px]"
      style={{ width: BIBLE_CARD_WIDTH, height: BIBLE_CARD_HEIGHT }}
    >
      <div
        className="flex aspect-square w-full flex-col items-center justify-center"
        style={{
          background: `linear-gradient(159deg, ${primary}, ${secondary})`,
          borderTopLeftRadius,
          borderTopRightRadius,
          borderBottomRightRadius,
          borderBottomLeftRadius,
        }}
      >
        <div
          className="handwrittenV2 flex h-full w-full flex-col items-center justify-center gap-[20px] whitespace-pre-wrap py-[20px] text-center text-white"
          style={{
            paddingLeft: verseStyle.paddingX,
            paddingRight: verseStyle.paddingX,
          }}
        >
          <div
            className="whitespace-normal text-balance break-keep tracking-[1px]"
            style={{
              fontSize: verseStyle.fontSize,
              lineHeight: `${verseStyle.lineHeight}px`,
            }}
          >
            {bibleSentence}
          </div>
          <div className="text-[24px] leading-tight tracking-[1px]">
            {content.bibleReference}
          </div>
        </div>
      </div>

      <div style={{ color: primary }} className="flex min-w-0 flex-col">
        <div className="truncate text-[40px] font-bold">{content.name}</div>
        <div className="flex flex-wrap gap-x-[8px] text-[20px] text-black-500">
          {content.keywords.slice(0, MAX_BIBLE_CARD_KEYWORDS).map((keyword) => (
            <span key={keyword}>#{keyword}</span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-[25px] left-[30px] right-[30px] flex justify-between text-[#666666]">
        <span className="tracking-[1px]">{`${content.date.year}.${content.date.month}.${content.date.day}.`}</span>
        <div>@prayu.official</div>
      </div>
    </div>
  );
};

interface ScaledBibleCardProps {
  content: BibleCardContent;
  className?: string;
}

export const ScaledBibleCard = ({
  content,
  className,
}: ScaledBibleCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    setWidth(element.clientWidth);
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("aspect-[3/4] w-full overflow-hidden", className)}
    >
      {width > 0 && (
        <div
          style={{
            width: BIBLE_CARD_WIDTH,
            height: BIBLE_CARD_HEIGHT,
            transform: `scale(${width / BIBLE_CARD_WIDTH})`,
            transformOrigin: "top left",
          }}
        >
          <BibleCardBase content={content} />
        </div>
      )}
    </div>
  );
};
