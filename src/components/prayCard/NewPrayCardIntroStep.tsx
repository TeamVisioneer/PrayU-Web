import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { analyticsTrack } from "@/analytics/analytics";
import PrayCard from "./PrayCard";
import { dummyPrayCard2 } from "@/mocks/dummyPrayCard";

interface NewPrayCardIntroStepProps {
  onNext: () => void;
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

const NewPrayCardIntroStep: React.FC<NewPrayCardIntroStepProps> = ({
  onNext,
}) => {
  const handleStart = () => {
    analyticsTrack("클릭_기도카드생성_시작하기", { where: "인트로" });
    onNext();
  };

  return (
    <div className="flex flex-col items-center h-full overflow-y-auto">
      <motion.div className="mb-8 text-center" variants={itemVariants}>
        <motion.div
          variants={itemVariants}
          className="text-left w-5/6 mx-auto mb-10"
        >
          <PrayCard prayCard={dummyPrayCard2} isMoreBtn={false} />
        </motion.div>
        <motion.h1 className="text-2xl font-bold mb-2" variants={itemVariants}>
          이번 주 기도카드 만들기
        </motion.h1>
        <motion.p className="text-gray-600" variants={itemVariants}>
          매 주 나의 일상과 기도제목을 나누고 말씀을 받아보세요
        </motion.p>
      </motion.div>
      <motion.div className="w-3/4" variants={itemVariants}>
        <Button
          onClick={handleStart}
          className="w-full py-6 text-base bg-blue-500 hover:bg-blue-600 mb-10"
        >
          시작하기
        </Button>
      </motion.div>
    </div>
  );
};

export default NewPrayCardIntroStep;
