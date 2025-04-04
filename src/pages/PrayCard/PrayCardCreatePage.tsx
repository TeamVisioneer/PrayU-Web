import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Group } from "supabase/types/tables";

// Components
import ProgressBar from "@/components/common/ProgressBar";
import NewPrayCardIntroStep from "@/components/prayCard/NewPrayCardIntroStep";
import NewPrayCardLifeShareStep from "@/components/prayCard/NewPrayCardLifeShareStep";
import NewPrayCardRequestStep from "@/components/prayCard/NewPrayCardRequestStep";
import NewPrayCardGroupSelectStep from "@/components/prayCard/NewPrayCardGroupSelectStep";
import NewPrayCardCompletionStep from "@/components/prayCard/NewPrayCardCompletionStep";
import PrayCardHeader from "@/components/prayCard/PrayCardHeader";

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

const PrayCardCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const step = parseInt(searchParams.get("step") || "0");
  const [lifeShare, setLifeShare] = useState("");
  const [prayContent, setPrayContent] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
  const [selectedBibleVerse] = useState(
    SAMPLE_BIBLE_VERSES[Math.floor(Math.random() * SAMPLE_BIBLE_VERSES.length)]
  );

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
    // In real implementation, this would save data to the database for each selected group
    if (selectedGroups.length > 0) {
      selectedGroups.forEach((group) => {
        console.log({
          lifeShare,
          prayContent,
          group,
          selectedBibleVerse,
        });
        // Here you would call API to create a prayer card for each group
      });
    }
    navigate("/home"); // Navigate to home page after completion
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
      <PrayCardHeader title="기도카드 생성" onBack={handlePrev} />

      {/* Progress bar */}
      <ProgressBar currentStep={step} totalSteps={totalSteps} />

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div
          key={step}
          className="h-full transition-opacity duration-300 ease-in-out"
        >
          {getStepContent()}
        </div>
      </div>
    </div>
  );
};

export default PrayCardCreatePage;
