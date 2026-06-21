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
  const navigate = useNavigate();
  const user = useBaseStore((state) => state.user);
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const fetchUserPrayCardList = useBaseStore(
    (state) => state.fetchUserPrayCardList
  );
  const fetchMemberListByUserId = useBaseStore(
    (state) => state.fetchMemberListByUserId
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
  // 생성 완료 후 뒤로가기로 그룹선택 단계에 돌아왔을 때 재생성을 막기 위한 플래그.
  // 단계 전환 시 스텝 컴포넌트는 언마운트되므로, 항상 떠 있는 이 페이지에 둔다.
  const [hasCreated, setHasCreated] = useState(false);

  useEffect(() => {
    if (user) fetchUserPrayCardList(user.id, 1, 0);
    if (user) fetchMemberListByUserId(user.id);
  }, [user, fetchUserPrayCardList, fetchMemberListByUserId]);

  const totalSteps = 5; // Increased by 1 for the group selection step

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setSearchParams({ step: (step + 1).toString() });
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      navigate(-1);
    }
  };

  // 상단 뒤로가기: 단계만큼 쌓인 history 를 한 번에 빠져나가 진입 전 페이지로 이동
  const handleExit = () => {
    navigate(-(step + 1));
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
            hasCreated={hasCreated}
            onCreated={() => setHasCreated(true)}
          />
        );
      case 4:
        return <NewPrayCardCompletionStep selectedGroups={selectedGroups} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <PrayCardHeader onBack={handleExit} />

      {/* Progress bar */}
      <ProgressBar currentStep={step} totalSteps={totalSteps} />

      {/* Content area */}
      <div className="flex-grow overflow-y-auto px-6 pt-6">
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
