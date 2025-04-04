import React, { useState } from "react";

interface FlippableCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  initialSide?: "front" | "back";
}

const FlippableCard: React.FC<FlippableCardProps> = ({
  frontContent,
  backContent,
  initialSide = "front",
}) => {
  const [isFlipped, setIsFlipped] = useState(initialSide === "back");
  const [isFlipping, setIsFlipping] = useState(false);

  const handleFlip = () => {
    if (isFlipping) return; // Prevent multiple flips while animation is in progress

    setIsFlipping(true);
    setIsFlipped(!isFlipped);

    // Reset the flipping state after animation completes
    setTimeout(() => {
      setIsFlipping(false);
    }, 700); // Match this to the duration of your transition
  };

  return (
    <div className="w-full h-full perspective-1000">
      <div
        className={`relative w-full h-full transform-style-3d transition-all duration-700 ease-in-out ${
          isFlipped ? "rotate-y-180" : ""
        } ${isFlipping ? "pointer-events-none" : ""}`}
      >
        {/* Front side */}
        <div
          className={`absolute w-full h-full backface-hidden ${
            isFlipped ? "invisible" : ""
          } transition-all duration-300 ${
            isFlipping && !isFlipped ? "scale-[0.98]" : "scale-100"
          }`}
          onClick={handleFlip}
        >
          {frontContent}
        </div>

        {/* Back side */}
        <div
          className={`absolute w-full h-full backface-hidden rotate-y-180 ${
            isFlipped ? "" : "invisible"
          } transition-all duration-300 ${
            isFlipping && isFlipped ? "scale-[0.98]" : "scale-100"
          }`}
          onClick={handleFlip}
        >
          {backContent}
        </div>
      </div>
    </div>
  );
};

export default FlippableCard;
