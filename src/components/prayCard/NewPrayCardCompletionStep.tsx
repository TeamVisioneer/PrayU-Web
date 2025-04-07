import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import PrayCard from "./PrayCard";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useBaseStore from "@/stores/baseStore";
import { Group } from "supabase/types/tables";
interface NewPrayCardCompletionStepProps {
  selectedGroups: Group[];
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

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, delay: 0.3 },
  },
};

const NewPrayCardCompletionStep: React.FC<NewPrayCardCompletionStepProps> = ({
  selectedGroups,
}) => {
  const navigate = useNavigate();

  const user = useBaseStore((state) => state.user);

  const fetchUserPrayCardList = useBaseStore(
    (state) => state.fetchUserPrayCardList
  );
  const historyPrayCardList = useBaseStore(
    (state) => state.historyPrayCardList
  );

  const handleComplete = () => {
    localStorage.removeItem("prayCardContent");
    localStorage.removeItem("prayCardLife");
    navigate("/group");
  };

  useEffect(() => {
    if (user) fetchUserPrayCardList(user.id);
  }, [user, fetchUserPrayCardList]);

  const prayCard = historyPrayCardList?.[0];

  return (
    <div className="flex flex-col items-center h-full relative">
      {/* Dimmed overlay */}
      {/* <div className="fixed inset-0 bg-black/85 z-10" /> */}

      {/* Card container with spotlight effect */}
      <motion.div
        className="w-3/4 mx-auto relative z-20 my-10"
        variants={cardVariants}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 -m-6 bg-blue-400/20 rounded-3xl blur-xl"></div>

        {/* Card */}
        <div className="relative">
          <PrayCard prayCard={prayCard || null} />
        </div>
      </motion.div>

      <motion.div
        className="text-center relative z-20 mb-3"
        variants={itemVariants}
      >
        <motion.h1 className="text-2xl font-bold mb-1" variants={itemVariants}>
          기도카드가 생성 완료!
        </motion.h1>
        <motion.p className="text-gray-500" variants={itemVariants}>
          총 {selectedGroups.length}개의 그룹에 기도카드가 생성 되었어요!
        </motion.p>

        {selectedGroups.length > 0 && (
          <motion.div
            className="bg-blue-50/90 rounded-lg my-4 relative z-20 flex flex-col items-center w-full"
            variants={itemVariants}
          >
            <div className="flex flex-wrap gap-2 w-full items-center justify-center">
              {selectedGroups.map((group) => {
                return (
                  <div
                    key={group.id}
                    className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full"
                  >
                    <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                      {group?.name ? [...group.name][0] : ""}
                    </div>
                    <p className="text-sm font-medium text-gray-800">
                      {group?.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div className="relative z-20 w-3/4" variants={itemVariants}>
        <Button
          onClick={handleComplete}
          className="w-full py-6 text-base bg-blue-500 hover:bg-blue-600"
        >
          그룹 홈으로 가기
        </Button>
      </motion.div>
    </div>
  );
};

export default NewPrayCardCompletionStep;
