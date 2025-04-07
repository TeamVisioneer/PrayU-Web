import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Group } from "supabase/types/tables";
import { motion, AnimatePresence } from "framer-motion";

// Components
import ProgressBar from "@/components/common/ProgressBar";
import NewPrayCardIntroStep from "@/components/prayCard/NewPrayCardIntroStep";
import NewPrayCardLifeShareStep from "@/components/prayCard/NewPrayCardLifeShareStep";
import NewPrayCardRequestStep from "@/components/prayCard/NewPrayCardRequestStep";
import NewPrayCardGroupSelectStep from "@/components/prayCard/NewPrayCardGroupSelectStep";
import NewPrayCardCompletionStep from "@/components/prayCard/NewPrayCardCompletionStep";
import PrayCardHeader from "@/components/prayCard/PrayCardHeader";
import useBaseStore from "@/stores/baseStore";

// Sample Bible verses - In real implementation, these would come from an API or database
const SAMPLE_BIBLE_VERSES = [
  {
    verse:
      "내가 진실로 진실로 너희에게 이르노니 한 알의 밀이 땅에 떨어져 죽지 아니하면 한 알 그대로 있고 죽으면 많은 열매를 맺느니라",
    reference: "요한복음 12:24",
  },
  {
    verse:
      "그러므로 형제들아 내가 하나님의 모든 자비하심으로 너희를 권하노니 너희 몸을 하나님이 기뻐하시는 거룩한 산 제물로 드리라 이는 너희의 드릴 영적 예배니라",
    reference: "로마서 12:1",
  },
  {
    verse:
      "여호와를 의뢰하고 선을 행하라 땅에 머무는 동안 그의 성실을 먹을 거리로 삼을지어다",
    reference: "시편 37:3",
  },
];

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const PrayCardCreatePage = () => {
  const user = useBaseStore((state) => state.user);
  const fetchUserPrayCardList = useBaseStore(
    (state) => state.fetchUserPrayCardList
  );

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const step = parseInt(searchParams.get("step") || "0");

  const [lifeShare, setLifeShare] = useState(
    localStorage.getItem("prayCardLife") || ""
  );
  const [prayContent, setPrayContent] = useState(
    localStorage.getItem("prayCardContent") || ""
  );
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
  const [selectedBibleVerse] = useState(
    SAMPLE_BIBLE_VERSES[Math.floor(Math.random() * SAMPLE_BIBLE_VERSES.length)]
  );

  useEffect(() => {
    if (user) fetchUserPrayCardList(user.id, 1, 0);
    console.log(user);
  }, [user, fetchUserPrayCardList]);

  const totalSteps = 5; // Increased by 1 for the group selection step

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setSearchParams({ step: (step + 1).toString() });
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setSearchParams({ step: (step - 1).toString() });
    }
  };

  const handleComplete = () => {
    navigate("/group"); // Navigate to home page after completion
  };

  const handleGroupSelect = (groups: Group[]) => {
    setSelectedGroups(groups);
  };

  const getStepContent = () => {
    switch (step) {
      case 0:
        return <NewPrayCardIntroStep onNext={handleNext} />;
      case 1:
        return (
          <NewPrayCardLifeShareStep
            value={lifeShare}
            onChange={setLifeShare}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 2:
        return (
          <NewPrayCardRequestStep
            value={prayContent}
            onChange={setPrayContent}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 3:
        return (
          <NewPrayCardGroupSelectStep
            selectedGroups={selectedGroups}
            onGroupSelect={handleGroupSelect}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 4:
        return (
          <NewPrayCardCompletionStep
            lifeShare={lifeShare}
            prayContent={prayContent}
            bibleVerse={selectedBibleVerse}
            selectedGroups={selectedGroups}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-mainBg">
      {/* Header */}
      <PrayCardHeader />

      {/* Progress bar */}
      <ProgressBar currentStep={step} totalSteps={totalSteps} />

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="h-full"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
          >
            {getStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PrayCardCreatePage;
