import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThanksCard, ThanksCardItem } from "@/components/thanksCard";

interface ThanksCardAnimationOverlayProps {
  newCard?: ThanksCard | null;
  onAnimationComplete?: () => void;
}

export interface ThanksCardAnimationOverlayRef {
  addCard: (card: ThanksCard) => void;
}

/**
 * 새로운 감사카드 생성 애니메이션을 관리하는 오버레이 컴포넌트
 * 큐 시스템으로 여러 카드가 연속으로 생성될 때 순차적으로 애니메이션 처리
 */
const ThanksCardAnimationOverlay = ({
  newCard,
  onAnimationComplete,
}: ThanksCardAnimationOverlayProps) => {
  const [cardQueue, setCardQueue] = useState<ThanksCard[]>([]);
  const [currentCard, setCurrentCard] = useState<ThanksCard | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const processedCardIds = useRef<Set<number>>(new Set());

  // 새로운 카드가 props로 전달되면 큐에 추가 (중복 방지)
  useEffect(() => {
    if (newCard && !processedCardIds.current.has(newCard.id)) {
      processedCardIds.current.add(newCard.id);
      setCardQueue((prev) => [...prev, newCard]);
    }
  }, [newCard]);

  /**
   * 다음 카드 애니메이션 시작
   */
  const processNextCard = useCallback(() => {
    setCardQueue((prev) => {
      const [nextCard, ...remaining] = prev;
      if (nextCard) {
        setCurrentCard(nextCard);
        setIsAnimating(true);
      }
      return remaining;
    });
  }, []);

  /**
   * 애니메이션 완료 처리
   */
  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
    setCurrentCard(null);
    onAnimationComplete?.();

    // 다음 카드가 있으면 약간의 딜레이 후 처리
    setTimeout(() => {
      if (cardQueue.length > 0) {
        processNextCard();
      }
    }, 500);
  }, [cardQueue.length, processNextCard, onAnimationComplete]);

  // 큐에 카드가 추가되고 현재 애니메이션이 없으면 다음 카드 처리
  useEffect(() => {
    if (cardQueue.length > 0 && !isAnimating && !currentCard) {
      processNextCard();
    }
  }, [cardQueue.length, isAnimating, currentCard, processNextCard]);

  // 오버레이가 표시될 조건: 현재 카드가 있거나 큐에 카드가 있을 때
  const shouldShowOverlay = currentCard !== null || cardQueue.length > 0;

  return (
    <AnimatePresence>
      {shouldShowOverlay && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* 딤 처리 배경 */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* 카드 애니메이션 영역 */}
          <AnimatePresence mode="wait">
            {currentCard && (
              <motion.div
                key={currentCard.id}
                className="relative z-10 max-w-sm mx-4"
                initial={{
                  scale: 0.3,
                  opacity: 0,
                  rotateY: -15,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  rotateY: 0,
                }}
                exit={{
                  scale: 0.8,
                  opacity: 0,
                  y: -20,
                }}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 20,
                  duration: 1.2,
                }}
                onAnimationComplete={() => {
                  // 카드가 완전히 나타난 후 3.5초 후에 사라짐
                  setTimeout(handleAnimationComplete, 3500);
                }}
              >
                {/* 카드 뒤 글로우 효과 */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-xl opacity-30 scale-110" />

                {/* 실제 카드 */}
                <div className="relative">
                  <ThanksCardItem card={currentCard} />
                </div>

                {/* 새 카드 알림 텍스트 */}
                <motion.div
                  className="text-center mt-6 text-white"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.6, ease: "easeOut" }}
                >
                  <div className="text-lg font-medium mb-1">
                    🎉 새로운 감사카드
                  </div>
                  <div className="text-sm opacity-90">
                    소중한 감사의 마음이 전해졌어요
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThanksCardAnimationOverlay;
