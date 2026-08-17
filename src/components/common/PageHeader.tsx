import { IoChevronBack } from "react-icons/io5";

interface PageHeaderProps {
  title: string;
  /** 기본: history 한 칸 뒤로 */
  onBack?: () => void;
  /** 우측 액션 슬롯 (설정 아이콘, 저장 버튼 등) */
  right?: React.ReactNode;
  hideBack?: boolean;
}

/**
 * 공용 페이지 헤더 — 좌 뒤로 · 중앙 제목 · 우 슬롯.
 *
 * 같은 모양의 sticky 헤더가 8개 파일에 복붙되어 있던 것을 통일했다
 * (docs/plans/identity/design-system.md — 재사용성/역할과 책임).
 * 배경은 페이지와 같은 mainBg — 헤더가 본문과 다른 색이면 상단에 띠가 생긴다
 * (2026-08-17 결정, glass-chrome 은 하단 네비만).
 *
 * router 를 import 하지 않는다 — 뒤로가기는 history API, 특수 동작은 `onBack` 으로.
 */
const PageHeader = ({ title, onBack, right, hideBack }: PageHeaderProps) => (
  <header className="sticky top-0 z-50 flex h-[52px] w-full items-center border-b border-gray-100 bg-mainBg px-4 shadow-sm">
    {!hideBack && (
      <button
        type="button"
        aria-label="뒤로"
        onClick={onBack ?? (() => window.history.back())}
        className="absolute left-3 rounded-lg p-1.5 transition-colors hover:bg-white/60"
      >
        <IoChevronBack size={20} className="text-liteBlack" />
      </button>
    )}
    <h1 className="w-full truncate px-12 text-center text-lg font-bold text-black">
      {title}
    </h1>
    {right && (
      <div className="absolute right-3 flex items-center gap-1">{right}</div>
    )}
  </header>
);

export default PageHeader;
