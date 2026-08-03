import { useEffect, useState } from "react";
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
import { assetUrl } from "@/lib/assetUrl";
import { PrayCard } from "../prayCard/PrayCard";
import ReactionResultBox from "../pray/ReactionResultBox";
import PrayCardWithBibleCard from "../prayCard/PrayCardWithBibleCard";
import ShareButtonGroup from "../share/ShareButtonGroup";
import { analyticsTrack } from "@/analytics/analytics";
import { getDomainUrl } from "@/lib/utils";

const PrayCardHistoryDrawer: React.FC = () => {
  const navigate = useNavigate();
  const isOpenHistoryDrawer = useBaseStore(
    (state) => state.isOpenHistoryDrawer
  );
  const setIsOpenHistoryDrawer = useBaseStore(
    (state) => state.setIsOpenHistoryDrawer
  );
  const historyCard = useBaseStore((state) => state.historyCard);
  const user = useBaseStore((state) => state.user);
  const legacyBibleCardUrl = historyCard?.bible_card_url;

  // 말씀카드 면(진입 기본)인지 여부 — 보이는 면에 따라 하단 액션을 바꾼다
  const [isBibleSideVisible, setIsBibleSideVisible] = useState(true);
  useEffect(() => {
    setIsBibleSideVisible(true);
  }, [historyCard?.id]);

  const onClickCreateBibleCard = () => {
    if (!historyCard) return;
    analyticsTrack("클릭_말씀카드_페이지", {
      where: "PrayCardHistoryDrawer",
    });
    setIsOpenHistoryDrawer(false);
    navigate(`/bible-card/new?praycard_id=${historyCard.id}`);
  };

  // 미연결·舊체계 카드에서만 만들기 유도. 연결된 카드에는 재생성 진입점을 두지 않는다
  // — 보관함의 주 행동은 열람·공유이고, 재생성은 LLM 한도를 쓰는 교정용 액션이다
  const createBibleCardButton = (label: string) => (
    <Button
      variant="primary"
      onClick={onClickCreateBibleCard}
      className="mt-3 h-[48px] w-full rounded-xl text-base"
    >
      {label}
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
            {/* 목록에서 말씀카드 썸네일을 눌러 진입하므로 말씀카드 면부터 보여준다.
                key: 다른 카드로 전환 시 플립 상태 리셋 */}
            <PrayCardWithBibleCard
              key={historyCard.id}
              prayCard={historyCard}
              initialFlipped
              onFlipChange={setIsBibleSideVisible}
            />
            {isBibleSideVisible ? (
              <ShareButtonGroup
                where="PrayCardHistoryDrawer"
                publicUrl={
                  assetUrl(historyCard.bible_card.image_key) ??
                  historyCard.bible_card.image_url ??
                  undefined
                }
                shareUrl={`${getDomainUrl()}/bible-card/share/${historyCard.bible_card.id}`}
                kakaoServerCallbackArgs={
                  user
                    ? { user_id: user.id, feature: "bible_card" }
                    : undefined
                }
              />
            ) : (
              <ReactionResultBox
                prayCard={historyCard || undefined}
                variant="separated"
                eventOption={{ where: "HistoryCard" }}
              />
            )}
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
            {createBibleCardButton("말씀카드 만들기")}
          </div>
        ) : (
          <div className="flex flex-col gap-2 px-10 pt-5 pb-10">
            <PrayCard prayCard={historyCard || undefined} />
            <ReactionResultBox
              prayCard={historyCard || undefined}
              variant="separated"
              eventOption={{ where: "HistoryCard" }}
            />
            {historyCard && createBibleCardButton("말씀카드 만들기")}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default PrayCardHistoryDrawer;
