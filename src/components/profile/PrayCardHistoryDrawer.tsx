import { useNavigate } from "react-router-dom";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import useBaseStore from "@/stores/baseStore";
import { PrayCard } from "../prayCard/PrayCard";
import ReactionResultBox from "../pray/ReactionResultBox";
import PrayCardWithBibleCard from "../prayCard/PrayCardWithBibleCard";
import { analyticsTrack } from "@/analytics/analytics";

const PrayCardHistoryDrawer: React.FC = () => {
  const navigate = useNavigate();
  const isOpenHistoryDrawer = useBaseStore(
    (state) => state.isOpenHistoryDrawer
  );
  const setIsOpenHistoryDrawer = useBaseStore(
    (state) => state.setIsOpenHistoryDrawer
  );
  const historyCard = useBaseStore((state) => state.historyCard);
  const legacyBibleCardUrl = historyCard?.bible_card_url;

  // 말씀카드 미연결 카드에만 노출 (레거시 bible_card_url 카드도 새 체계로 만들도록 유도)
  const onClickCreateBibleCard = () => {
    if (!historyCard) return;
    analyticsTrack("클릭_말씀카드_페이지", {
      where: "PrayCardHistoryDrawer",
    });
    setIsOpenHistoryDrawer(false);
    navigate(`/bible-card/new?praycard_id=${historyCard.id}`);
  };

  const createBibleCardButton = (
    <Button
      variant="primary"
      onClick={onClickCreateBibleCard}
      className="h-[48px] w-full rounded-xl text-base"
    >
      말씀카드 만들기
    </Button>
  );
  return (
    <Drawer
      open={isOpenHistoryDrawer}
      onOpenChange={(open) => {
        setIsOpenHistoryDrawer(open);
        if (!open && window.history.state?.open === true) window.history.back();
      }}
    >
      <DrawerContent className="bg-mainBg max-h-90vh">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        {historyCard?.bible_card ? (
          <div className="flex flex-col gap-4 px-10 pt-5 pb-10 overflow-y-auto">
            <PrayCardWithBibleCard prayCard={historyCard} />
            <ReactionResultBox
              prayCard={historyCard || undefined}
              variant="separated"
              eventOption={{ where: "HistoryCard" }}
            />
          </div>
        ) : legacyBibleCardUrl ? (
          <div className="flex flex-col gap-2 px-10 pt-5 pb-10 overflow-y-auto">
            <div className="flex-shrink-0 w-11/12 mx-auto rounded-xl overflow-hidden shadow-md">
              <img
                src={legacyBibleCardUrl}
                className="w-full object-cover rounded-xl"
                alt="기도카드 이미지"
              />
            </div>
            <div className="flex flex-col gap-3 bg-white/5 p-4 rounded-lg">
              <h3 className="text-base font-semibold text-primary">
                기도카드 내용
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {historyCard.content}
              </p>
            </div>
            {createBibleCardButton}
          </div>
        ) : (
          <div className="flex flex-col gap-2 px-10 pt-5 pb-10">
            <PrayCard prayCard={historyCard || undefined} />
            <ReactionResultBox
              prayCard={historyCard || undefined}
              variant="separated"
              eventOption={{ where: "HistoryCard" }}
            />
            {historyCard && createBibleCardButton}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default PrayCardHistoryDrawer;
