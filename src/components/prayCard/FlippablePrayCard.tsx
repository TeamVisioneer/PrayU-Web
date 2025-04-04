import React from "react";
import FlippableCard from "./FlippableCard";
import BibleVerse from "./BibleVerse";
import PrayCard from "./PrayCard";

interface FlippablePrayCardProps {
  // Bible verse props for front side
  bibleVerse: {
    verse: string;
    reference: string;
  };

  // Prayer card props for back side
  prayCardProps: {
    user: {
      id: string;
      name: string;
      avatarUrl?: string;
    };
    lifeShare: string;
    prayContent: string;
    createdAt: Date;
  };

  initialSide?: "front" | "back";
}

const FlippablePrayCard: React.FC<FlippablePrayCardProps> = ({
  bibleVerse,
  prayCardProps,
  initialSide = "front",
}) => {
  return (
    <div className="w-full aspect-[3/4]">
      <FlippableCard
        frontContent={
          <BibleVerse
            verse={bibleVerse.verse}
            reference={bibleVerse.reference}
          />
        }
        backContent={
          <PrayCard
            user={prayCardProps.user}
            lifeShare={prayCardProps.lifeShare}
            prayContent={prayCardProps.prayContent}
            createdAt={prayCardProps.createdAt}
          />
        }
        initialSide={initialSide}
      />
    </div>
  );
};

export default FlippablePrayCard;
