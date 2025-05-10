import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import useBaseStore from "@/stores/baseStore";
import { analyticsTrack } from "@/analytics/analytics";

interface NewPrayCardLifeShareStepProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

// Animation variants for staggered child elements
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const SUGGESTIONS = [
  "요즘 운동 열심히 하고 있어요",
  "친구랑 오랜만에 만나서 맛있는 거 먹고 수다 떨었어요",
  "요즘 감기 기운이 있어서 컨디션이 좋지 않아요",
  "가족이랑 주말에 캠핑 다녀왔는데 힐링이었어요",
  "요즘 자격증 공부 중이라 정신이 없어요",
  "집 근처에 새로 생긴 카페에 다녀왔는데 분위기가 좋았어요",
  "강아지가 아파서 병원 다녀왔는데 걱정이 많아요",
  "새로운 취미를 시작해서 요즘 그것에 푹 빠져있어요",
  "직장에서 업무량이 많아 조금 지쳐있어요",
  "최근에 좋은 책을 읽었는데 많은 도움이 되었어요",
  "부모님 건강이 안 좋아서 자주 연락하고 있어요",
  "오랜만에 여행 계획을 세우고 있어요",
  "집 정리를 하면서 오래된 추억들을 되살렸어요",
  "새로운 동네로 이사왔는데 적응하는 중이에요",
  "요즘 새벽기도에 참석하고 있는데 많은 은혜를 받고 있어요",
  "영화 한 편 봤는데 너무 감동적이었어요",
  "아이들이 학교 생활 잘하고 있어서 감사해요",
  "요즘 다이어트 중인데 의지가 약해져서 고민이에요",
];

const NewPrayCardLifeShareStep: React.FC<NewPrayCardLifeShareStepProps> = ({
  value,
  onChange,
  onNext,
  onPrev,
}) => {
  const historyPrayCardList = useBaseStore(
    (state) => state.historyPrayCardList
  );

  // 랜덤 추천 문구는 컴포넌트가 마운트될 때 한 번만 계산
  const randomSuggestions = useMemo(() => {
    const shuffled = [...SUGGESTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, []);

  const handleLoadPreviousLifeShare = () => {
    analyticsTrack("클릭_기도카드생성_이전내용불러오기", { where: "일상나눔" });
    const previousLifeShare = historyPrayCardList?.[0]?.life;
    if (previousLifeShare) {
      onChange(previousLifeShare);
      localStorage.setItem("prayCardLife", previousLifeShare);
    }
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    localStorage.setItem("prayCardLife", e.target.value);
  };

  const handleNext = () => {
    analyticsTrack("클릭_기도카드생성_다음", { where: "일상나눔" });
    onNext();
  };

  const handlePrev = () => {
    analyticsTrack("클릭_기도카드생성_이전", { where: "일상나눔" });
    onPrev();
  };

  const handleSelectSuggestion = (suggestion: string) => {
    analyticsTrack("클릭_기도카드생성_추천문구", { text: suggestion });
    onChange(suggestion);
    localStorage.setItem("prayCardLife", suggestion);
  };

  return (
    <div className="flex flex-col h-full">
      <motion.div
        className="flex justify-between items-center mb-2"
        variants={itemVariants}
      >
        <motion.h1 className="text-lg font-bold" variants={itemVariants}>
          이번 주 나의 일상을 나눠주세요
        </motion.h1>
        <motion.div variants={itemVariants}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLoadPreviousLifeShare()}
            disabled={
              !historyPrayCardList?.[0]?.life ||
              value == historyPrayCardList?.[0]?.life
            }
            className="text-xs text-blue-500 hover:text-blue-600"
          >
            기존 내용 불러오기
          </Button>
        </motion.div>
      </motion.div>

      <motion.div className="flex-grow" variants={itemVariants}>
        <motion.div
          className="h-full max-h-24 relative"
          variants={itemVariants}
        >
          <Textarea
            placeholder="최근에 있었던 일, 감사한 일, 어려운 일 등을 자유롭게 적어주세요"
            className="w-full h-full resize-none p-4 rounded-xl placeholder:text-gray-400 border-gray-200 focus:border-blue-300 focus:ring-blue-200 bg-gray-50/50"
            value={value}
            onChange={(e) => handleOnChange(e)}
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {randomSuggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                className="text-xs rounded-full bg-gray-50 border-gray-200 hover:bg-blue-50 hover:text-blue-600"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <motion.div className="flex gap-2 my-5 z-10" variants={itemVariants}>
        <Button
          onClick={handlePrev}
          variant="outline"
          className="flex-1 py-6 text-base"
        >
          이전
        </Button>
        <Button
          onClick={handleNext}
          className="flex-1 py-6 text-base bg-blue-500 hover:bg-blue-600"
        >
          {value.length > 0 ? "다음" : "건너뛰기"}
        </Button>
      </motion.div>
    </div>
  );
};

export default NewPrayCardLifeShareStep;
