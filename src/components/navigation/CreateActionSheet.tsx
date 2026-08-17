import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { analyticsTrack } from "@/analytics/analytics";

interface CreateActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 네비 `+` 액션 시트 — 기존 생성 경로 3개로 연결만 한다 (새 개념 없음).
 * 제목이 "오늘 무엇을 남길까요?" 인 이유: 기록-퍼스트 정체성(identity/overview.md)의
 * 목소리다 — 만들기는 오늘의 기록을 남기는 행위다. 항목은 데일리 기록(daily.md) 때 늘어난다.
 */
// 아이콘 타일 없이 텍스트로만 — "그라디언트 사각형 + 아이콘" 나열은 AI 생성 티가 난다
// (design-system.md 품질 기준). 행을 구분하는 것은 장식이 아니라 제목의 무게다.
// 감사카드는 공식 기능이 아니라 노출하지 않는다 (2026-08-17) — 경로 자체는 살아 있다.
const CREATE_ACTIONS = [
  {
    label: "기도카드",
    description: "이번 주 기도제목을 그룹에 나눠요",
    path: "/praycard/new",
  },
  {
    label: "말씀카드",
    description: "내 기도에 맞는 말씀을 찾아 카드로 만들어요",
    path: "/bible-card/new",
  },
];

const CreateActionSheet = ({ open, onOpenChange }: CreateActionSheetProps) => {
  const navigate = useNavigate();

  const onSelect = (label: string, path: string) => {
    analyticsTrack("클릭_네비_만들기_" + label, {});
    onOpenChange(false);
    // replace: 현재 최상단은 드로워가 쌓은 {open:true} 엔트리다 — 덮어써서
    // 목적지에서 뒤로가기가 정확히 한 페이지 뒤(이 화면)로 오게 한다 (use-history-overlay.ts)
    navigate(path, { replace: true });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {/* 배경색 대신 그라디언트를 겹친다 — 시트(글래스 크롬)와 카드가 같은 흰색으로
          붙어 보이던 문제를, 시트를 mainBg 쪽으로 기울여 층을 분리하는 방식으로 푼다 */}
      <DrawerContent className="mx-auto max-w-app overflow-hidden bg-gradient-to-b from-surfaceChrome/60 to-mainBg">
        {/* 시그니처: 제목 뒤에서 스미는 accent 광원 — 장식 요소는 이 한 곳뿐 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(70%_100%_at_50%_0%,rgb(var(--accent-from)/0.14),transparent_75%)]"
        />
        <div className="relative px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-2">
          <DrawerHeader className="p-0 pb-4 text-left">
            <DrawerTitle className="text-[19px] font-bold tracking-tight text-black">
              오늘 무엇을 남길까요?
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              만들 항목을 선택하세요
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-3">
            {CREATE_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => onSelect(action.label, action.path)}
                className="flex items-center rounded-2xl border border-glassBorder/70 bg-gradient-to-br from-surfaceCard to-surfaceCard/60 px-5 py-[18px] text-left shadow-glass transition-all duration-150 active:scale-[0.98] active:shadow-none"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="text-[17px] font-bold text-black">
                    {action.label}
                  </span>
                  <span className="mt-1 text-[13px] leading-snug text-dark">
                    {action.description}
                  </span>
                </span>
                <ChevronRight
                  size={18}
                  className="ml-auto shrink-0 text-accentFrom/70"
                />
              </button>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateActionSheet;
