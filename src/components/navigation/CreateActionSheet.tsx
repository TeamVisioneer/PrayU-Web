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
  {
    label: "감사카드",
    description: "감사한 순간을 사진과 함께 남겨요",
    path: "/thanks-card/new",
  },
];

const CreateActionSheet = ({ open, onOpenChange }: CreateActionSheetProps) => {
  const navigate = useNavigate();

  const onSelect = (label: string, path: string) => {
    analyticsTrack("클릭_네비_만들기_" + label, {});
    onOpenChange(false);
    navigate(path);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-app">
        <div className="px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-1">
          <DrawerHeader className="p-0 pb-3.5 text-left">
            <DrawerTitle className="text-[17px] font-bold tracking-tight text-black">
              오늘 무엇을 남길까요?
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              만들 항목을 선택하세요
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-2.5">
            {CREATE_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => onSelect(action.label, action.path)}
                className="flex items-center rounded-[1.25rem] border border-black/[0.04] bg-white px-5 py-4 text-left shadow-sm transition-all duration-150 active:scale-[0.98] active:shadow-none"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="text-base font-bold text-black">
                    {action.label}
                  </span>
                  <span className="mt-1 text-[13px] leading-snug text-dark">
                    {action.description}
                  </span>
                </span>
                <ChevronRight
                  size={18}
                  className="ml-auto shrink-0 text-deactivate"
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
