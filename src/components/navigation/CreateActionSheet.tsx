import { useNavigate } from "react-router-dom";
import { BookOpenText, HandHeart, Sparkles } from "lucide-react";
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
 * 항목이 늘면(묵상 기록 등 — docs/plans/identity/daily.md) 여기에 추가된다.
 */
const CREATE_ACTIONS = [
  {
    label: "기도카드",
    description: "이번 주 기도제목을 그룹에 나눠요",
    path: "/praycard/new",
    icon: <HandHeart size={22} />,
    iconBg: "bg-gradient-to-br from-start to-middle",
  },
  {
    label: "말씀카드",
    description: "내 기도에 맞는 말씀을 찾아 카드로 만들어요",
    path: "/bible-card/new",
    icon: <BookOpenText size={22} />,
    iconBg: "bg-gradient-to-br from-middle to-end",
  },
  {
    label: "감사카드",
    description: "감사한 순간을 사진과 함께 남겨요",
    path: "/thanks-card/new",
    icon: <Sparkles size={22} />,
    iconBg: "bg-gradient-to-br from-prayCardStart to-prayCardMiddle",
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
      <DrawerContent className="mx-auto max-w-app bg-surfaceChrome/90 backdrop-blur-xl">
        <DrawerHeader className="pb-2 text-left">
          <DrawerTitle>만들기</DrawerTitle>
          <DrawerDescription className="sr-only">
            만들 항목을 선택하세요
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-1 px-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {CREATE_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => onSelect(action.label, action.path)}
              className="flex items-center gap-3 rounded-2xl border border-glassBorder/50 bg-surfaceCard/60 p-3 text-left active:bg-surfaceCard/90"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${action.iconBg}`}
              >
                {action.icon}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-liteBlack">
                  {action.label}
                </span>
                <span className="text-xs text-dark">{action.description}</span>
              </span>
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateActionSheet;
