import { Fragment, ReactNode } from "react";

/**
 * 공지 본문용 **간이 마크다운**.
 *
 * 라이브러리를 쓰지 않는 이유: 공지 모달이 사용자 앱 번들에 상시 포함되어,
 * 어드민 작성 편의를 위해 마크다운 파서(수십 KB)를 모든 사용자에게 내려보낼 수 없다.
 * 공지에 실제로 필요한 표현만 지원한다.
 *
 * 지원 문법
 *  - `**굵게**`
 *  - `- 항목`  (연속 줄은 하나의 목록으로 묶임)
 *  - 빈 줄로 문단 구분
 */

/** `**굵게**` 처리 — 나머지는 평문 그대로 */
const renderInline = (text: string): ReactNode[] => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={index} className="font-semibold text-gray-800">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
};

export const NoticeMarkdown = ({ source }: { source: string }) => {
  const lines = source.split("\n");
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = () => {
    if (bullets.length === 0) return;
    blocks.push(
      <ul
        key={`ul-${blocks.length}`}
        className="list-disc space-y-1 pl-4 text-sm leading-relaxed text-gray-600"
      >
        {bullets.map((item, index) => (
          <li key={index}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) {
      bullets.push(trimmed.slice(2));
      continue;
    }
    flushBullets();
    if (trimmed.length === 0) continue;
    blocks.push(
      <p
        key={`p-${blocks.length}`}
        className="text-sm leading-relaxed text-gray-600"
      >
        {renderInline(trimmed)}
      </p>,
    );
  }
  flushBullets();

  return <div className="flex flex-col gap-2">{blocks}</div>;
};
