import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { Info, Repeat } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { fetchTodayBibleCardUsage, searchBible } from "@/apis/bible";
import { fetchTodayShareReward } from "@/apis/llmUsage";
import { createBibleCard } from "@/apis/bibleCard";
import { updatePrayCard } from "@/apis/prayCard";
import PrayCard from "@/components/prayCard/PrayCard";
import BibleCardView from "@/components/prayCard/BibleCard";
import { BibleCardBase } from "@/components/prayCard/BibleCardBase";
import BibleCardThumbnail from "@/components/prayCard/BibleCardThumbnail";
import ShowMoreBtn from "@/components/common/ShowMoreBtn";
import ShareButtonGroup from "@/components/share/ShareButtonGroup";
import BibleCardGuideSheet from "./BibleCardGuideSheet";
import useBaseStore from "@/stores/baseStore";
import { useSaveImage } from "@/hooks/useSaveImage";
import { analyticsTrack } from "@/analytics/analytics";
import { getDomainUrl, getISOTodayDateYMD, getTodayNumber } from "@/lib/utils";
import {
  BIBLE_CARD_COLOR_PRESETS,
  BIBLE_CARD_DAILY_LIMIT,
  MAX_BIBLE_CARD_KEYWORDS,
} from "@/constants/bibleCard";
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

// 네 모서리를 독립 랜덤으로 크게 흔들어(40~200px) 의도적으로 찌그러진 비대칭 블롭 연출
const getRandomRadius = (): string[] =>
  Array.from({ length: 4 }, () => `${Math.floor(Math.random() * 160) + 40}px`);
const STATIC_SKELETON_RADIUS = "42% 58% 48% 52% / 46% 44% 56% 54%";
const INITIAL_PRAY_CARD_PAGE_SIZE = 18;
const MORE_PRAY_CARD_PAGE_SIZE = 18;

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
  return (
    <div className="relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-xl border border-dashed border-blue-200 bg-[#FEFDFC] px-5 py-4 text-center shadow-prayCard">
      <div className={isCreating ? "animate-pulse" : ""}>
        <div
          className={`flex aspect-square w-full flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-sky-100 to-emerald-50 px-7 py-8 ${
            isCreating ? "animate-blob" : ""
          }`}
          style={isCreating ? undefined : { borderRadius: STATIC_SKELETON_RADIUS }}
        >
          <div className="h-3 w-10/12 rounded-full bg-white/80" />
          <div className="mt-3 h-3 w-8/12 rounded-full bg-white/70" />
          <div className="mt-7 h-2 w-5/12 rounded-full bg-white/70" />
        </div>

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
    </div>
  );
};

const PrayCardBibleBackPreview = ({
  prayCard,
  bibleCard,
  isFlipped,
  isCreating,
  onFlip,
  cardOverlay,
}: {
  prayCard: PrayCardWithProfiles;
  bibleCard: BibleCardType | null | undefined;
  isFlipped: boolean;
  isCreating: boolean;
  onFlip: () => void;
  // 카드 위에 겹쳐 띄우는 액션 — 회전 컨테이너 밖이라 플립에 함께 돌지 않는다
  cardOverlay?: React.ReactNode;
}) => (
  <div className="flex w-full flex-col items-center gap-3">
    {/* 카드 전체가 플립 트리거 — 앞면 오버레이(버튼)를 품어야 해서 div로 둔다 */}
    <div
      role="button"
      tabIndex={isCreating ? -1 : 0}
      onClick={isCreating ? undefined : onFlip}
      onKeyDown={(e) => {
        if (isCreating) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onFlip();
        }
      }}
      className="w-full perspective-1000 text-left"
    >
      <div
        className={`relative aspect-[3/4] w-full transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        <div className="absolute inset-0 backface-hidden">
          <PrayCard prayCard={prayCard} isMoreBtn={false} editable={false} />
          {/* 앞면 안에 있어 카드와 함께 뒤집히고, 뒷면에서는 보이지 않는다 */}
          {cardOverlay && (
            <div className="absolute right-3 top-3 z-20">{cardOverlay}</div>
          )}
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
    </div>
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
  const [todayUsedCount, setTodayUsedCount] = useState<number | null>(null);
  const [todayRewardCount, setTodayRewardCount] = useState<number | null>(null);
  const prevRewardRef = useRef<number | null>(null);
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const praycardIdParam = searchParams.get("praycard_id");
  const legacyPrayCardIdParam = searchParams.get("prayCardId");
  const prayCardId = praycardIdParam || legacyPrayCardIdParam;
  const prayCards =
    historyPrayCardListView.length > 0
      ? historyPrayCardListView
      : historyPrayCardList || [];
  const selectedBibleCard = selectedPrayCard?.bible_card;
  const selectedBibleCardShareUrl = selectedBibleCard
    ? `${getDomainUrl()}/bible-card/share/${selectedBibleCard.id}`
    : undefined;
  const displayName =
    myProfile?.full_name || user?.user_metadata.full_name || "PrayU";
  // 표시용 남은 횟수 = 기본 한도 + 공유 보상 - 사용. 조회 실패(null)면 표시만 생략 — 실제 한도는 서버가 강제
  const remainingCount =
    todayUsedCount === null
      ? null
      : Math.max(
          0,
          BIBLE_CARD_DAILY_LIMIT + (todayRewardCount ?? 0) - todayUsedCount,
        );

  const refreshQuota = () => {
    fetchTodayBibleCardUsage().then(setTodayUsedCount);
    fetchTodayShareReward("bible_card").then((rewards) => {
      if (rewards === null) return;
      // 공유 보상(웹훅)은 비동기 도착 — 복귀 시 증가를 감지해 안내
      if (prevRewardRef.current !== null && rewards > prevRewardRef.current) {
        toast({ description: "공유 보상으로 생성 횟수가 +1 되었어요" });
      }
      prevRewardRef.current = rewards;
      setTodayRewardCount(rewards);
    });
  };

  useEffect(() => {
    if (!user) return;
    refreshQuota();
    // 카카오톡 다녀온 뒤(웹훅 도착 후) 보상 반영을 위해 화면 복귀 시 재조회
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshQuota();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [user]);

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
    // 이미 말씀카드가 연결된 카드는 뒷면(말씀카드)부터 보여준다
    setIsFlipped(Boolean(prayCard.bible_card));
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

  // 신규 생성과 재생성(교체)이 공유하는 생성 플로우.
  // "이미 연결된 카드" 차단은 하지 않는다 — 교체는 확인 다이얼로그가 게이트
  const handleCreateBibleCard = async () => {
    if (!user || !selectedPrayCard || isCreating) return;
    if (remainingCount === 0) {
      toast({
        description:
          "오늘 생성 횟수를 모두 사용했어요. 카카오톡으로 공유하면 1회 더 만들 수 있어요",
      });
      return;
    }
    const isReplacing = Boolean(selectedPrayCard.bible_card);

    analyticsTrack("클릭_말씀카드_생성", {
      where: "BibleCardNewPage",
      prayCardId: selectedPrayCard.id,
      isReplacing,
    });

    setIsCreating(true);
    setIsFlipped(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 650));

      const query = `#일상: ${selectedPrayCard.life} #기도제목: ${selectedPrayCard.content}`;
      const { bible, keywords, errorCode } = await searchBible(
        query,
        selectedPrayCard.id,
      );

      if (errorCode === "DAILY_LIMIT_EXCEEDED") {
        toast({
          description:
            "오늘 생성 가능 횟수를 모두 사용했어요. 내일 다시 만들 수 있어요",
        });
        setIsFlipped(isReplacing);
        return;
      }
      if (errorCode === "LOGIN_REQUIRED") {
        toast({ description: "로그인 후 이용할 수 있어요" });
        setIsFlipped(isReplacing);
        return;
      }

      const targetBible = bible?.[0];
      if (!targetBible || !keywords) {
        toast({ description: "말씀을 가져오지 못했어요. 다시 시도해 주세요" });
        setIsFlipped(isReplacing);
        return;
      }

      const limitedKeywords = keywords.slice(0, MAX_BIBLE_CARD_KEYWORDS);

      const colors = [
        ...BIBLE_CARD_COLOR_PRESETS[
          Math.floor(Math.random() * BIBLE_CARD_COLOR_PRESETS.length)
        ],
      ];
      const radius = getRandomRadius();
      const nextDraft = {
        bibleReference: createBibleReference(targetBible),
        bibleSentence: targetBible.sentence,
        colors,
        radius,
        keywords: limitedKeywords,
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
        setIsFlipped(isReplacing);
        return;
      }

      const bibleCard = await createBibleCard({
        user_id: user.id,
        name: displayName,
        keywords: limitedKeywords,
        bible_reference: nextDraft.bibleReference,
        bible_sentence: nextDraft.bibleSentence,
        colors,
        radius,
        image_url: imageUrl,
      });

      if (!bibleCard) {
        toast({ description: "말씀카드를 저장하지 못했어요" });
        setIsFlipped(isReplacing);
        return;
      }

      // 교체 시에도 기존 row는 남기고 연결만 새 id로 갱신 (히스토리 확장 여지)
      await updatePrayCard(selectedPrayCard.id, {
        bible_card_id: bibleCard.id,
      });
      updateSelectedPrayCard(selectedPrayCard, bibleCard);
      toast({
        description: isReplacing
          ? "새 말씀카드로 교체했어요"
          : "기도카드 뒷면에 말씀카드를 붙였어요",
      });
      localStorage.removeItem("lastCreatedPrayCardId");
    } finally {
      setIsCreating(false);
      // LLM 호출이 발생했으면 성공/실패와 무관하게 차감되므로 서버 기준으로 재동기화
      refreshQuota();
    }
  };

  const handleClickReplace = () => {
    if (remainingCount === 0) {
      toast({
        description:
          "오늘 생성 횟수를 모두 사용했어요. 카카오톡으로 공유하면 1회 더 만들 수 있어요",
      });
      return;
    }
    analyticsTrack("클릭_말씀카드_재생성", {
      where: "BibleCardNewPage",
      prayCardId: selectedPrayCard?.id,
    });
    setIsReplaceDialogOpen(true);
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
                ? "기도카드를 골라주세요"
                : selectedBibleCard
                  ? "말씀카드가 연결되었어요"
                  : isCreating
                    ? "어울리는 말씀을 찾고 있어요"
                    : "어울리는 말씀을 찾아드릴게요"}
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
                      bibleCard={isCreating ? null : selectedBibleCard}
                      isFlipped={isFlipped}
                      isCreating={isCreating}
                      onFlip={() => setIsFlipped((prev) => !prev)}
                      cardOverlay={
                        // 카드 교체는 대상인 카드 위에 — 생성 전에만
                        !selectedBibleCard && !isCreating ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation(); // 카드 플립으로 전파 방지
                              setIsDrawerOpen(true);
                            }}
                            className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-500 transition active:scale-95"
                          >
                            <Repeat className="h-3 w-3" strokeWidth={2.5} />
                            카드 변경
                          </button>
                        ) : null
                      }
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
                    disabled={
                      isCreating ||
                      Boolean(selectedPrayCard && remainingCount === 0)
                    }
                    className="mt-5 h-[52px] w-full rounded-xl text-base disabled:opacity-70"
                  >
                    {isCreating ? (
                      <PulseLoader size={10} color="#f3f4f6" />
                    ) : !selectedPrayCard ? (
                      "기도카드 선택하기"
                    ) : remainingCount === 0 ? (
                      "오늘 생성 횟수를 모두 사용했어요"
                    ) : (
                      "뒷면에 말씀카드 만들기"
                    )}
                  </Button>
                  {selectedPrayCard && !isCreating && remainingCount !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        analyticsTrack("클릭_말씀카드_안내", {
                          where: "BibleCardNewPage",
                        });
                        setIsGuideOpen(true);
                      }}
                      className="mx-auto mt-2 flex items-center gap-1 py-1 text-xs text-gray-400 transition hover:text-gray-500"
                    >
                      <span>
                        {remainingCount > 0
                          ? `오늘 남은 생성 ${remainingCount}회`
                          : "카카오톡으로 공유하면 1회 더 만들 수 있어요"}
                      </span>
                      <Info className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          </section>

          {selectedBibleCard?.image_url && !isCreating && (
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
                  shareUrl={selectedBibleCardShareUrl}
                  kakaoServerCallbackArgs={{
                    user_id: user.id,
                    feature: "bible_card",
                  }}
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
                <button
                  type="button"
                  onClick={handleClickReplace}
                  className="mx-auto mt-3 block px-3 py-2 text-sm font-medium text-gray-400 transition hover:text-gray-500"
                >
                  새 말씀카드로 만들기
                </button>
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
                    initial={{ opacity: 0, y: 12 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.25, delay: index * 0.025 },
                    }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative flex aspect-[3/4] flex-col items-stretch justify-start overflow-hidden rounded-xl border bg-white p-2 text-left shadow-sm transition ${
                      selectedPrayCard?.id === prayCard.id
                        ? "border-blue-500 ring-2 ring-blue-100"
                        : "border-gray-100"
                    }`}
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

      <AlertDialog
        open={isReplaceDialogOpen}
        onOpenChange={setIsReplaceDialogOpen}
      >
        <AlertDialogContent className="w-5/6 rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>새 말씀카드로 교체할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              기존 말씀카드 대신 새로운 말씀카드가 뒷면에 붙어요.
              {remainingCount !== null && ` 오늘 남은 생성 ${remainingCount}회`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end gap-2">
            <AlertDialogCancel className="mt-0">취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsReplaceDialogOpen(false);
                handleCreateBibleCard();
              }}
            >
              새로 만들기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BibleCardGuideSheet open={isGuideOpen} onOpenChange={setIsGuideOpen} />

      {draft && (
        <div className="fixed -top-[100vh] -z-40 pointer-events-none">
          <div ref={bibleCardRef}>
            <BibleCardBase
              content={{
                name: displayName,
                bibleSentence: draft.bibleSentence,
                bibleReference: draft.bibleReference,
                colors: draft.colors,
                radius: draft.radius,
                keywords: draft.keywords,
                date: getISOTodayDateYMD(),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BibleCardNewPage;
