import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface BibleCardGuideSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// 말씀카드 매치 원리·생성 횟수 규칙 안내 시트 (문구는 docs/bible-card-usage-guide-plan.md 확정안)
const BibleCardGuideSheet: React.FC<BibleCardGuideSheetProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-mainBg">
        <DrawerHeader className="px-4 pt-2 pb-0 text-left">
          <DrawerTitle className="text-base font-semibold">
            말씀카드는 어떻게 만들어지나요?
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            말씀카드 생성 원리와 횟수 안내
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 px-4 pt-3 pb-10">
          <p className="text-sm leading-relaxed text-gray-600">
            선택한 기도카드의 기도제목과 나눔 내용을 바탕으로, 어울리는 성경
            구절을 골라 나만의 말씀카드를 만들어 드려요.
          </p>
          <div className="rounded-xl bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">
              생성 횟수 안내
            </h3>
            <ul className="flex list-disc flex-col gap-1.5 pl-4 text-sm leading-relaxed text-gray-600">
              <li>하루 3회까지 만들 수 있어요 (매일 자정 초기화)</li>
              <li>말씀카드를 다시 만들 때도 1회가 사용돼요</li>
              <li>만든 카드를 카카오톡 채팅방에 공유하면 1회가 추가돼요</li>
              <li>
                같은 채팅방 공유는 하루 1번만 인정되고, 나와의 채팅은 제외돼요
              </li>
            </ul>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default BibleCardGuideSheet;
