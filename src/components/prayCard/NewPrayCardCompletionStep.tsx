import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useBaseStore from "@/stores/baseStore";
import { Group } from "supabase/types/tables";
import { analyticsTrack } from "@/analytics/analytics";
import PrayCard from "./PrayCard";

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
    (state) => state.fetchUserPrayCardList,
  );

  const historyPrayCardList = useBaseStore(
    (state) => state.historyPrayCardList,
  );

  const handleComplete = async () => {
    // analyticsTrack("클릭_기도카드생성_그룹이동", { where: "완료페이지" });
    analyticsTrack("클릭_기도카드생성_내프로필", { where: "완료페이지" });
    if (!user) return;

    navigate("/profile/me");
  };

  const handleMoveToBibleCards = () => {
    analyticsTrack("클릭_말씀카드_페이지", {
      where: "기도카드생성_완료페이지",
    });
    const prayCardId =
      prayCard?.id || localStorage.getItem("lastCreatedPrayCardId");
    navigate(
      prayCardId
        ? `/bible-card/new?praycard_id=${prayCardId}`
        : "/bible-card/new",
    );
  };

  useEffect(() => {
    if (user) fetchUserPrayCardList(user.id);
  }, [user, fetchUserPrayCardList]);

  const prayCard = historyPrayCardList?.[0];

  return (
    <div className="flex flex-col items-center h-full relative">
      <motion.div
        className="w-5/6 mx-auto relative z-20 my-5"
        variants={cardVariants}
      >
        <div className="absolute inset-0 -m-6 bg-blue-400/20 rounded-3xl blur-xl"></div>

        <div className="relative">
          <PrayCard prayCard={prayCard} isMoreBtn={false} editable={false} />
        </div>
      </motion.div>

      <motion.div
        className="text-center relative z-20 mb-4"
        variants={itemVariants}
      >
        <motion.h1 className="text-2xl font-bold mb-1" variants={itemVariants}>
          기도카드 생성 완료!
        </motion.h1>
        <motion.p className="text-gray-500" variants={itemVariants}>
          {selectedGroups.length === 0
            ? ""
            : selectedGroups.length < 2
              ? `${selectedGroups[0]?.name} `
              : `${selectedGroups[0]?.name} 외 ${selectedGroups.length - 1}개의 `}
          그룹에 기도카드가 생성되었습니다.
        </motion.p>
      </motion.div>

      <motion.div
        className="relative z-20 w-3/4 flex flex-col gap-3"
        variants={itemVariants}
      >
        <Button
          onClick={handleMoveToBibleCards}
          className="w-full py-6 text-base bg-blue-500 hover:bg-blue-600"
        >
          말씀카드 만들기
        </Button>
        <Button
          onClick={handleComplete}
          variant="ghost"
          className="w-full py-6 text-base"
        >
          나중에 하기
        </Button>
      </motion.div>
    </div>
  );
};

export default NewPrayCardCompletionStep;
