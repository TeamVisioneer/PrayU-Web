import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <motion.div className="mb-6 text-center" variants={itemVariants}>
        <motion.h1 className="text-2xl font-bold mb-2" variants={itemVariants}>
          이번 주 기도카드 만들기
        </motion.h1>
        <motion.p className="text-gray-600" variants={itemVariants}>
          매주 나의 일상과 기도제목을 나누고 말씀을 받아보세요
        </motion.p>
      </motion.div>
      <motion.div className="w-full" variants={itemVariants}>
        <Button
          onClick={onNext}
          className="w-full py-6 text-base bg-blue-500 hover:bg-blue-600"
        >
          시작하기
        </Button>
      </motion.div>
    </div>
  );
};

export default NewPrayCardIntroStep;
