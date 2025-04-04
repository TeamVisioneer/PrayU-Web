import React from "react";
import { Button } from "@/components/ui/button";
import { Group } from "supabase/types/tables";
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
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 text-center">
        <div className="inline-block p-3 mb-4 rounded-full bg-blue-50">
          <div className="animate-scale-in">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2 animate-fade-in">
          기도카드가 생성 완료!
        </h1>
        <p className="text-gray-600 animate-fade-in delay-200">
          이번 주도 함께 기도해요
        </p>
      </div>

      <div className="my-6 animate-slide-in delay-300">
        <PrayCard
          user={user}
          lifeShare={lifeShare}
          prayContent={prayContent}
          createdAt={new Date()}
        />
      </div>

      <div className="bg-amber-50 p-4 rounded-lg mb-4 animate-slide-in delay-400">
        <p className="text-amber-900 font-medium text-sm mb-1">
          {bibleVerse.verse}
        </p>
        <p className="text-amber-700 text-xs text-right">
          {bibleVerse.reference}
        </p>
      </div>

      {selectedGroups.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4 animate-slide-in delay-500">
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

      <div className="mt-auto">
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
