import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  const targetGroup = useBaseStore((state) => state.targetGroup);

  const fetchUserPrayCardList = useBaseStore(
    (state) => state.fetchUserPrayCardList
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const step = parseInt(searchParams.get("step") || "0");

  const [lifeShare, setLifeShare] = useState(
    localStorage.getItem("prayCardLife") || ""
  );
  const [prayContent, setPrayContent] = useState(
    localStorage.getItem("prayCardContent") || ""
  );
  const [selectedGroups, setSelectedGroups] = useState<Group[]>(
    targetGroup ? [targetGroup] : []
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
        return <NewPrayCardCompletionStep selectedGroups={selectedGroups} />;
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
