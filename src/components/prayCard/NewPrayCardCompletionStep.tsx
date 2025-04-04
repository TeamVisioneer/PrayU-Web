import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Group } from "supabase/types/tables";
// import FlippablePrayCard from "./FlippablePrayCard";
import PrayCard from "./PrayCard";

interface NewPrayCardCompletionStepProps {
  lifeShare: string;
  prayContent: string;
  bibleVerse: { verse: string; reference: string };
  selectedGroups: Group[];
  onComplete: () => void;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

const NewPrayCardCompletionStep: React.FC<NewPrayCardCompletionStepProps> = ({
  lifeShare,
  prayContent,
  bibleVerse,
  selectedGroups,
  onComplete,
  user = {
    id: "current-user",
    name: "나",
  },
}) => {
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    // Trigger card reveal animation after component mount
    const timer = setTimeout(() => {
      setShowCard(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col h-full relative">
      {/* Dimmed overlay */}
      {/* <div className="fixed inset-0 bg-black/85 z-10" /> */}

      {/* Card container with spotlight effect */}
      <div
        className={`w-3/4 mx-auto relative z-20 my-6 transition-all duration-1000 transform ${
          showCard ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 -m-6 bg-blue-400/20 rounded-3xl blur-xl"></div>

        {/* Card */}
        <div className="relative">
          {/* <FlippablePrayCard
            bibleVerse={bibleVerse}
            prayCardProps={{
              user,
              lifeShare,
              prayContent,
              createdAt: new Date(),
            }}
            initialSide="front"
          /> */}
          <PrayCard
            user={user}
            lifeShare={lifeShare}
            prayContent={prayContent}
            createdAt={new Date()}
          />

          <div className="hidden">{bibleVerse.verse}</div>
        </div>
      </div>

      <div className="mb-6 text-center relative z-20">
        <h1 className="text-2xl font-bold mb-2 animate-fade-in">
          기도카드가 생성 완료!
        </h1>
        <p className="text-gray-500 animate-fade-in delay-200">
          이번 주도 그룹원들과 함께 기도해요
        </p>
      </div>

      {selectedGroups.length > 0 && (
        <div className="hidden bg-blue-50/90 p-4 rounded-lg mb-4 animate-slide-in delay-500 relative z-20">
          <h3 className="text-sm font-medium text-gray-700 mb-2">공유 그룹</h3>
          <div className="flex flex-wrap gap-2">
            {selectedGroups.map((group) => (
              <div
                key={group.id}
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full"
              >
                <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                  {group?.name ? [...group.name][0] : ""}
                </div>
                <p className="text-sm font-medium text-gray-800">
                  {group.name}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            각 그룹별로 기도카드가 생성되며, 그룹 페이지에서 확인할 수 있어요
          </p>
        </div>
      )}

      <div className="relative z-20">
        <Button
          onClick={onComplete}
          className="w-full py-6 text-base bg-blue-500 hover:bg-blue-600"
        >
          홈으로
        </Button>
      </div>
    </div>
  );
};

export default NewPrayCardCompletionStep;
