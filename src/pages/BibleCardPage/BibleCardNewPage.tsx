import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { PulseLoader } from "react-spinners";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { toast } from "@/components/ui/use-toast";
import { searchBible } from "@/apis/bible";
import { createBibleCard } from "@/apis/bibleCard";
import { updatePrayCard } from "@/apis/prayCard";
import PrayCard from "@/components/prayCard/PrayCard";
import BibleCardView from "@/components/prayCard/BibleCard";
import BibleCardThumbnail from "@/components/prayCard/BibleCardThumbnail";
import ShowMoreBtn from "@/components/common/ShowMoreBtn";
import ShareButtonGroup from "@/components/share/ShareButtonGroup";
import useBaseStore from "@/stores/baseStore";
import { useSaveImage } from "@/hooks/useSaveImage";
import { analyticsTrack } from "@/analytics/analytics";
import { getISOTodayDateYMD, getTodayNumber } from "@/lib/utils";
import { BIBLE_CARD_COLOR_PRESETS } from "@/constants/bibleCard";
import {
  BibleCard as BibleCardType,
  PrayCardWithProfiles,
} from "supabase/types/tables";

interface BibleCardDraft {
  bibleReference: string;
  bibleSentence: string;
  colors: string[];
  radius: string[];
  keywords: string[];
}

const getRandomRadius = () => `${Math.floor(Math.random() * 160) + 40}px`;
const STATIC_SKELETON_RADIUS = "42% 58% 48% 52% / 46% 44% 56% 54%";
const INITIAL_PRAY_CARD_PAGE_SIZE = 18;
const MORE_PRAY_CARD_PAGE_SIZE = 18;
const getRandomSkeletonRadius = () => {
  const values = Array.from(
    { length: 8 },
    () => `${Math.floor(Math.random() * 24) + 38}%`,
  );

  return `${values.slice(0, 4).join(" ")} / ${values.slice(4).join(" ")}`;
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, delay: 0.2 },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -8,
    transition: { duration: 0.18 },
  },
};

const ctaVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: 0.95 },
  },
};

const completionActionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 1.05 },
  },
};

const profileButtonVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: 1.25 },
  },
};

const createBibleReference = (bible: {
  long_label: string;
  chapter: number;
  paragraph: number;
}) =>
  bible.long_label === "시편"
    ? `${bible.long_label} ${bible.chapter}편 ${bible.paragraph}절`
    : `${bible.long_label} ${bible.chapter}장 ${bible.paragraph}절`;

const EmptyBibleCardBackSlot = ({ isCreating }: { isCreating: boolean }) => {
  const [skeletonRadius, setSkeletonRadius] = useState(STATIC_SKELETON_RADIUS);

  useEffect(() => {
    if (!isCreating) {
      setSkeletonRadius(STATIC_SKELETON_RADIUS);
      return;
    }

    setSkeletonRadius(getRandomSkeletonRadius());
    const intervalId = window.setInterval(() => {
      setSkeletonRadius(getRandomSkeletonRadius());
    }, 280);

    return () => window.clearInterval(intervalId);
  }, [isCreating]);

  return (
    <div className="relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-xl border border-dashed border-blue-200 bg-[#FEFDFC] px-5 py-4 text-center shadow-prayCard">
      <div className={isCreating ? "animate-pulse" : ""}>
        <motion.div
          className="flex aspect-square w-full flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-sky-100 to-emerald-50 px-7 py-8"
          animate={{ borderRadius: skeletonRadius }}
          transition={{ duration: isCreating ? 0.08 : 0 }}
        >
          <div className="h-3 w-10/12 rounded-full bg-white/80" />
          <div className="mt-3 h-3 w-8/12 rounded-full bg-white/70" />
          <div className="mt-7 h-2 w-5/12 rounded-full bg-white/70" />
        </motion.div>

        <div className="mt-4 space-y-2 text-left">
          <div className="h-8 w-28 rounded-lg bg-blue-100" />
          <div className="flex gap-2">
            <div className="h-4 w-12 rounded-full bg-gray-100" />
            <div className="h-4 w-12 rounded-full bg-gray-100" />
          </div>
        </div>

        <div className="absolute bottom-4 left-5 right-5 flex justify-between">
          <div className="h-3 w-16 rounded-full bg-gray-100" />
          <div className="h-3 w-20 rounded-full bg-gray-100" />
        </div>
      </div>

      {!isCreating && (
        <div className="absolute inset-x-6 top-[42%] rounded-2xl bg-white/80 px-4 py-4 shadow-sm backdrop-blur-sm">
          <p className="text-sm font-bold leading-snug text-gray-950">
            아직 뒷면이 비어 있어요
          </p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            말씀카드를 만들어 붙일 수 있어요.
          </p>
        </div>
      )}
    </div>
  );
};

const PrayCardBibleBackPreview = ({
  prayCard,
  bibleCard,
  isFlipped,
  isCreating,
  onFlip,
}: {
  prayCard: PrayCardWithProfiles;
  bibleCard: BibleCardType | null | undefined;
  isFlipped: boolean;
  isCreating: boolean;
  onFlip: () => void;
}) => (
  <div className="flex w-full flex-col items-center gap-3">
    <button
      type="button"
      onClick={onFlip}
      disabled={isCreating}
      className="w-full perspective-1000 text-left disabled:cursor-default"
    >
      <div
        className={`relative aspect-[3/4] w-full transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        <div className="absolute inset-0 backface-hidden">
          <PrayCard prayCard={prayCard} isMoreBtn={false} editable={false} />
        </div>
        <div className="absolute inset-0 rotate-y-180 backface-hidden">
          {bibleCard ? (
            <motion.div
              className="h-full w-full"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <BibleCardView bibleCard={bibleCard} />
            </motion.div>
          ) : (
            <EmptyBibleCardBackSlot isCreating={isCreating} />
          )}
        </div>
      </div>
    </button>
    <button
      type="button"
      onClick={onFlip}
      disabled={isCreating}
      className="rounded-full bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-sm disabled:opacity-60"
    >
      {isFlipped ? "기도카드 보기" : "뒷면 보기"}
    </button>
  </div>
);

const CaptureBibleCard = ({
  name,
  draft,
}: {
  name: string;
  draft: BibleCardDraft;
}) => {
  const { year, month, day } = getISOTodayDateYMD();
  const [primary = "#608CFF", secondary = "#AAC7FF"] = draft.colors;
  const [
    borderTopLeftRadius = "80px",
    borderTopRightRadius = "120px",
    borderBottomRightRadius = "80px",
    borderBottomLeftRadius = "120px",
  ] = draft.radius;

  return (
    <div className="relative flex aspect-[3/4] w-[380px] flex-col border border-gray-200 bg-[#FEFDFC] px-[30px] py-[20px]">
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
        <div className="handwrittenV2 flex h-full w-full flex-col items-center justify-center gap-[20px] whitespace-pre-wrap px-[50px] py-[20px] text-center text-white">
          <div className="text-[30px] leading-[35px] tracking-[1px]">
            {draft.bibleSentence.replace(/<[^>]*>/g, "").trim()}
          </div>
          <div className="text-[24px] leading-tight tracking-[1px]">
            {draft.bibleReference}
          </div>
        </div>
      </div>

      <div style={{ color: primary }} className="mt-0 flex flex-col">
        <div className="text-[40px] font-bold">{name}</div>
        <div className="flex gap-[8px] text-[20px] text-black-500">
          {draft.keywords.map((keyword) => (
            <span key={keyword}>#{keyword}</span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-[25px] flex gap-[130px] text-[#666666]">
        <span className="tracking-[1px]">{`${year}.${month}.${day}.`}</span>
        <div>@prayu.official</div>
      </div>
    </div>
  );
};

const BibleCardNewPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useBaseStore((state) => state.user);
  const myProfile = useBaseStore((state) => state.myProfile);
  const fetchUserPrayCardList = useBaseStore(
    (state) => state.fetchUserPrayCardList,
  );
  const historyPrayCardList = useBaseStore(
    (state) => state.historyPrayCardList,
  );
  const historyPrayCardListView = useBaseStore(
    (state) => state.historyPrayCardListView,
  );
  const setHistoryPrayCardListView = useBaseStore(
    (state) => state.setHistoryPrayCardListView,
  );

  const { saveImage } = useSaveImage();
  const bibleCardRef = useRef<HTMLDivElement>(null);
  const [selectedPrayCard, setSelectedPrayCard] =
    useState<PrayCardWithProfiles | null>(null);
  const [draft, setDraft] = useState<BibleCardDraft | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasMorePrayCards, setHasMorePrayCards] = useState(false);
  const [isLoadingMorePrayCards, setIsLoadingMorePrayCards] = useState(false);

  const praycardIdParam = searchParams.get("praycard_id");
  const legacyPrayCardIdParam = searchParams.get("prayCardId");
  const prayCardId = praycardIdParam || legacyPrayCardIdParam;
  const prayCards =
    historyPrayCardListView.length > 0
      ? historyPrayCardListView
      : historyPrayCardList || [];
  const selectedBibleCard = selectedPrayCard?.bible_card;
  const displayName =
    myProfile?.full_name || user?.user_metadata.full_name || "PrayU";

  useEffect(() => {
    if (!user) return;
    fetchUserPrayCardList(user.id, INITIAL_PRAY_CARD_PAGE_SIZE, 0).then(
      (prayCards) => {
        if (!prayCards) return;
        setHistoryPrayCardListView([...prayCards]);
        setHasMorePrayCards(prayCards.length === INITIAL_PRAY_CARD_PAGE_SIZE);

        if (!prayCardId) {
          setSelectedPrayCard(null);
          return;
        }

        const targetPrayCard =
          prayCards.find(
            (prayCard) =>
              prayCard.id === prayCardId && prayCard.user_id === user.id,
          ) || null;

        if (!targetPrayCard) {
          setSelectedPrayCard(null);
          setSearchParams(
            (prev) => {
              const nextParams = new URLSearchParams(prev);
              nextParams.delete("praycard_id");
              nextParams.delete("prayCardId");
              return nextParams;
            },
            { replace: true },
          );
          return;
        }

        setSelectedPrayCard(targetPrayCard);
        setIsFlipped(Boolean(targetPrayCard.bible_card));

        if (!praycardIdParam || legacyPrayCardIdParam) {
          setSearchParams(
            (prev) => {
              const nextParams = new URLSearchParams(prev);
              nextParams.delete("prayCardId");
              nextParams.set("praycard_id", targetPrayCard.id);
              return nextParams;
            },
            { replace: true },
          );
        }
      },
    );
  }, [
    user,
    prayCardId,
    praycardIdParam,
    legacyPrayCardIdParam,
    fetchUserPrayCardList,
    setHistoryPrayCardListView,
    setSearchParams,
  ]);

  const updateSelectedPrayCard = (
    prayCard: PrayCardWithProfiles,
    bibleCard: BibleCardType,
  ) => {
    const updatedPrayCard = {
      ...prayCard,
      bible_card_id: bibleCard.id,
      bible_card: bibleCard,
    };
    setSelectedPrayCard(updatedPrayCard);
    setIsFlipped(true);
    setHistoryPrayCardListView(
      prayCards.map((item) =>
        item.id === prayCard.id ? updatedPrayCard : item,
      ),
    );
  };

  const handleSelectPrayCard = (prayCard: PrayCardWithProfiles) => {
    if (isCreating) return;
    if (prayCard.bible_card) return;
    if (selectedPrayCard?.id === prayCard.id) {
      analyticsTrack("클릭_말씀카드_기도카드선택해제", {
        where: "BibleCardNewPage",
        prayCardId: prayCard.id,
      });
      setDraft(null);
      setSelectedPrayCard(null);
      setIsFlipped(false);
      setSearchParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev);
          nextParams.delete("praycard_id");
          nextParams.delete("prayCardId");
          return nextParams;
        },
        { replace: true },
      );
      return;
    }

    analyticsTrack("클릭_말씀카드_기도카드선택", {
      where: "BibleCardNewPage",
      prayCardId: prayCard.id,
    });
    setDraft(null);
    setSelectedPrayCard(prayCard);
    setIsFlipped(false);
    setSearchParams(
      (prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.delete("prayCardId");
        nextParams.set("praycard_id", prayCard.id);
        return nextParams;
      },
      { replace: true },
    );
  };

  const handleLoadMorePrayCards = async () => {
    if (!user || isLoadingMorePrayCards) return;

    setIsLoadingMorePrayCards(true);
    try {
      const nextPrayCards = await fetchUserPrayCardList(
        user.id,
        MORE_PRAY_CARD_PAGE_SIZE,
        prayCards.length,
      );

      if (!nextPrayCards) return;

      const loadedPrayCardIds = new Set(
        prayCards.map((prayCard) => prayCard.id),
      );
      const uniqueNextPrayCards = nextPrayCards.filter(
        (prayCard) => !loadedPrayCardIds.has(prayCard.id),
      );

      setHistoryPrayCardListView([...prayCards, ...uniqueNextPrayCards]);
      setHasMorePrayCards(nextPrayCards.length === MORE_PRAY_CARD_PAGE_SIZE);
    } finally {
      setIsLoadingMorePrayCards(false);
    }
  };

  const renderHeader = () => (
    <header className="sticky top-0 z-50 flex items-center border-b bg-mainBg p-4">
      <button onClick={() => navigate(-1)} className="absolute left-4">
        <IoChevronBack size={20} />
      </button>
      <h1 className="w-full text-center text-lg font-bold">말씀카드 만들기</h1>
    </header>
  );

  const handleMoveToProfile = () => {
    analyticsTrack("클릭_말씀카드_프로필확인", {
      where: "BibleCardNewPage",
      prayCardId: selectedPrayCard?.id,
      bibleCardId: selectedBibleCard?.id,
    });
    navigate("/profile/me");
  };

  const handleCreateBibleCard = async () => {
    if (!user || !selectedPrayCard || isCreating) return;
    if (selectedPrayCard.bible_card) {
      toast({ description: "이미 연결된 말씀카드가 있어요" });
      return;
    }

    analyticsTrack("클릭_말씀카드_생성", {
      where: "BibleCardNewPage",
      prayCardId: selectedPrayCard.id,
    });

    setIsCreating(true);
    setIsFlipped(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 650));

      const query = `#일상: ${selectedPrayCard.life} #기도제목: ${selectedPrayCard.content}`;
      const { bible, keywords } = await searchBible(query);
      const targetBible = bible?.[0];

      if (!targetBible || !keywords) {
        toast({ description: "말씀을 가져오지 못했어요. 다시 시도해 주세요" });
        return;
      }

      const colors = [
        ...BIBLE_CARD_COLOR_PRESETS[
          Math.floor(Math.random() * BIBLE_CARD_COLOR_PRESETS.length)
        ],
      ];
      const radius = [
        getRandomRadius(),
        getRandomRadius(),
        getRandomRadius(),
        getRandomRadius(),
      ];
      const nextDraft = {
        bibleReference: createBibleReference(targetBible),
        bibleSentence: targetBible.sentence,
        colors,
        radius,
        keywords,
      };
      setDraft(nextDraft);

      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });

      const imageUrl = await saveImage(bibleCardRef, {
        storagePath: "BibleCard/UserBibleCard",
        fileName: `Card_${getTodayNumber()}_${selectedPrayCard.id}.jpeg`,
        imageFormat: "jpeg",
        quality: 0.95,
        scale: 2,
      });

      if (!imageUrl) {
        toast({ description: "말씀카드 이미지를 저장하지 못했어요" });
        return;
      }

      const bibleCard = await createBibleCard({
        user_id: user.id,
        name: displayName,
        keywords,
        bible_reference: nextDraft.bibleReference,
        bible_sentence: nextDraft.bibleSentence,
        colors,
        radius,
        image_url: imageUrl,
      });

      if (!bibleCard) {
        toast({ description: "말씀카드를 저장하지 못했어요" });
        return;
      }

      await updatePrayCard(selectedPrayCard.id, {
        bible_card_id: bibleCard.id,
      });
      updateSelectedPrayCard(selectedPrayCard, bibleCard);
      toast({ description: "기도카드 뒷면에 말씀카드를 붙였어요" });
      localStorage.removeItem("lastCreatedPrayCardId");
    } finally {
      setIsCreating(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-full w-full flex-col bg-mainBg">
        {renderHeader()}
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <h1 className="text-xl font-bold">로그인이 필요해요</h1>
          <p className="text-sm text-gray-500">
            내 기도카드에 말씀카드를 연결하려면 먼저 로그인해 주세요.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-mainBg">
      {renderHeader()}
      <main className="flex-1 overflow-y-auto">
        <div className="flex min-h-full w-full flex-col px-5 pb-6 pt-5">
          <motion.section
            className="pb-5 text-center"
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            <p className="text-[22px] font-bold leading-snug text-gray-950">
              {!selectedPrayCard
                ? "말씀을 붙일 기도카드를 골라주세요"
                : selectedBibleCard
                  ? "말씀카드가 연결되었어요"
                  : isCreating
                    ? "이 기도에 어울리는 말씀을 찾고 있어요"
                    : "이 기도에 어울리는 말씀을 찾아드릴게요"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              {!selectedPrayCard
                ? "선택한 기도카드의 뒷면에 말씀카드가 만들어져요."
                : selectedBibleCard
                  ? "이제 기도카드 뒷면에서 말씀을 함께 볼 수 있어요."
                  : "기도카드를 뒤집어 뒷면에 붙을 말씀카드를 확인해 보세요."}
            </p>
          </motion.section>

          <section className="flex flex-col items-center pb-3">
            <div className="w-full max-w-[320px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedPrayCard ? selectedPrayCard.id : "empty"}
                  className="mx-auto w-full"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={cardVariants}
                >
                  {!selectedPrayCard ? (
                    <motion.button
                      type="button"
                      onClick={() => setIsDrawerOpen(true)}
                      className="flex aspect-[3/4] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-white/70 px-7 text-center shadow-sm"
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold text-blue-500">
                        +
                      </div>
                      <p className="mt-5 text-lg font-bold text-gray-900">
                        기도카드를 선택해 주세요
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-gray-500">
                        기도제목과 일상 나눔을 바탕으로 어울리는 말씀을
                        추천해드릴게요.
                      </p>
                    </motion.button>
                  ) : (
                    <PrayCardBibleBackPreview
                      prayCard={selectedPrayCard}
                      bibleCard={selectedBibleCard}
                      isFlipped={isFlipped}
                      isCreating={isCreating}
                      onFlip={() => setIsFlipped((prev) => !prev)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {!selectedBibleCard && (
                <motion.div
                  key={`cta-${selectedPrayCard?.id || "empty"}`}
                  initial="hidden"
                  animate="visible"
                  variants={ctaVariants}
                >
                  <Button
                    variant="primary"
                    onClick={
                      selectedPrayCard
                        ? handleCreateBibleCard
                        : () => setIsDrawerOpen(true)
                    }
                    disabled={isCreating}
                    className="mt-5 h-[52px] w-full rounded-xl text-base disabled:opacity-70"
                  >
                    {isCreating ? (
                      <PulseLoader size={10} color="#f3f4f6" />
                    ) : selectedPrayCard ? (
                      "뒷면에 말씀카드 만들기"
                    ) : (
                      "기도카드 선택하기"
                    )}
                  </Button>
                  {selectedPrayCard && !isCreating && (
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(true)}
                      className="mx-auto mt-3 block px-3 py-2 text-sm font-medium text-gray-400 transition hover:text-gray-500"
                    >
                      다른 기도카드 선택
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          </section>

          {selectedBibleCard?.image_url && (
            <section className="mx-auto mt-1 w-full max-w-[320px] space-y-3">
              <motion.div
                className="rounded-2xl bg-white shadow-sm"
                initial="hidden"
                animate="visible"
                variants={completionActionVariants}
              >
                <ShareButtonGroup
                  where="BibleCardNewPage"
                  publicUrl={selectedBibleCard.image_url}
                />
              </motion.div>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={profileButtonVariants}
              >
                <Button
                  variant="primary"
                  onClick={handleMoveToProfile}
                  className="h-[52px] w-full rounded-xl text-base font-semibold"
                >
                  내 프로필에서 확인하기
                </Button>
              </motion.div>
            </section>
          )}
        </div>
      </main>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[85vh] bg-mainBg pb-7">
          <DrawerHeader className="px-6 pb-4 pt-5 text-center">
            <DrawerTitle className="text-[18px] font-bold text-[#222222]">
              기도카드 선택하기
            </DrawerTitle>
            <DrawerDescription className="text-sm text-[#919191]">
              말씀카드를 붙일 기도카드를 선택한 뒤 완료해 주세요.
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-5 pb-4">
            <div className="grid grid-cols-3 gap-3">
              {prayCards.map((prayCard, index) => {
                const hasBibleCard = Boolean(prayCard.bible_card);
                const bibleCard = prayCard.bible_card;

                return (
                  <motion.button
                    type="button"
                    key={prayCard.id}
                    onClick={() => handleSelectPrayCard(prayCard)}
                    disabled={hasBibleCard}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.25, delay: index * 0.025 },
                    }}
                    whileTap={hasBibleCard ? undefined : { scale: 0.97 }}
                    className={`relative flex aspect-[3/4] flex-col items-stretch justify-start overflow-hidden rounded-xl border bg-white p-2 text-left shadow-sm transition disabled:pointer-events-auto ${
                      selectedPrayCard?.id === prayCard.id
                        ? "border-blue-500 ring-2 ring-blue-100"
                        : "border-gray-100"
                    } ${hasBibleCard ? "cursor-not-allowed bg-gray-50 opacity-65" : ""}`}
                  >
                    {hasBibleCard ? (
                      <BibleCardThumbnail
                        bibleCard={bibleCard}
                        dimmed
                        label="연결됨"
                      />
                    ) : (
                      <>
                        <div className="mb-1 flex items-start">
                          <span className="truncate text-[11px] font-bold text-blue-600">
                            {prayCard.group?.name || "내 기도카드"}
                          </span>
                        </div>
                        <p className="line-clamp-6 text-[11px] leading-relaxed text-gray-700">
                          {prayCard.content || prayCard.life}
                        </p>
                      </>
                    )}
                  </motion.button>
                );
              })}
            </div>
            {hasMorePrayCards && (
              <div className="mt-4 flex justify-center">
                <ShowMoreBtn
                  isLoading={isLoadingMorePrayCards}
                  onClick={handleLoadMorePrayCards}
                />
              </div>
            )}
          </div>
          <div className="border-t border-white/70 bg-mainBg px-5 pt-4">
            <Button
              variant="primary"
              onClick={() => setIsDrawerOpen(false)}
              className="h-[52px] w-full rounded-xl text-base"
            >
              선택 완료
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {draft && (
        <div className="fixed -top-[100vh] -z-40 pointer-events-none">
          <div ref={bibleCardRef} className="w-[380px] aspect-[3/4]">
            <CaptureBibleCard name={displayName} draft={draft} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BibleCardNewPage;
