import React from "react";
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

const NewPrayCardLifeShareStep: React.FC<NewPrayCardLifeShareStepProps> = ({
  value,
  onChange,
  onNext,
  onPrev,
}) => {
  const historyPrayCardList = useBaseStore(
    (state) => state.historyPrayCardList
  );
  const isValid = value.trim().length > 0;

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
            disabled={!historyPrayCardList?.[0].life}
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
        </motion.div>
        <motion.div
          className="flex justify-between items-center mt-2"
          variants={itemVariants}
        >
          <div className="text-xs text-gray-500">
            <span className="text-blue-500 font-medium">Tip</span> 길게 쓸 필요
            없어요. 간단하게 나눠보세요!
          </div>
          <div className="text-xs text-gray-400">{value.length}</div>
        </motion.div>
      </motion.div>

      <motion.div className="flex gap-2" variants={itemVariants}>
        <Button
          onClick={handlePrev}
          variant="outline"
          className="flex-1 py-6 text-base"
        >
          이전
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isValid}
          className={`flex-1 py-6 text-base ${
            isValid
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          다음
        </Button>
      </motion.div>
    </div>
  );
};

export default NewPrayCardLifeShareStep;
