import { prayController } from "@/apis/office/prayController";
import { getISOOnlyDate, getISOTodayDate } from "@/lib/utils";
import useBaseStore from "@/stores/baseStore";
import React, { useState, useEffect, useRef } from "react";
import { PrayCardWithProfiles } from "supabase/types/tables";

interface PrayerTimerButtonProps {
  prayDuration?: number; // in seconds
  currentPrayCard?: PrayCardWithProfiles | null;
}

const PrayerTimerButton: React.FC<PrayerTimerButtonProps> = ({
  prayDuration = 30,
  currentPrayCard,
}) => {
  const user = useBaseStore((state) => state.user);

  const [isPraying, setIsPraying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(prayDuration);
  const [progress, setProgress] = useState(0); // Start at 0 progress

  const [prayCount, setPrayCount] = useState(
    currentPrayCard?.pray.filter((pray) => pray.user_id === user?.id).length ||
      0
  );
  const [hasPrayedToday, setHasPrayedToday] = useState(
    currentPrayCard?.pray.some(
      (pray) =>
        pray.user_id === user?.id &&
        getISOOnlyDate(pray.created_at) === getISOTodayDate()
    ) || false
  );

  // Update hasPrayedToday and prayCount when currentPrayCard changes
  useEffect(() => {
    if (currentPrayCard && user) {
      setPrayCount(
        currentPrayCard.pray.filter((pray) => pray.user_id === user.id)
          .length || 0
      );
      setHasPrayedToday(
        currentPrayCard.pray.some(
          (pray) =>
            pray.user_id === user.id &&
            getISOOnlyDate(pray.created_at) === getISOTodayDate()
        ) || false
      );
    } else {
      setPrayCount(0);
      setHasPrayedToday(false);
    }
  }, [currentPrayCard, user]);

  // References for smooth animation
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  // Calculate stroke-dasharray and stroke-dashoffset for the circular progress
  const circleRadius = 40;
  const circumference = 2 * Math.PI * circleRadius;

  // Animate with requestAnimationFrame for smoother transitions
  const animate = async (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
      lastUpdateRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const totalDuration = prayDuration * 1000; // convert to milliseconds

    // Calculate new progress percentage (0 to 100)
    const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
    setProgress(newProgress);

    // Update the time display approximately every second
    const secondsSinceLastUpdate = (timestamp - lastUpdateRef.current) / 1000;
    if (secondsSinceLastUpdate >= 1 || newProgress >= 100) {
      const newTimeLeft = Math.max(
        prayDuration - Math.floor(elapsed / 1000),
        0
      );
      setTimeLeft(newTimeLeft);
      lastUpdateRef.current = timestamp;
    }

    // Continue animation or complete
    if (elapsed < totalDuration) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Timer complete
      setHasPrayedToday(true);
      setPrayCount(prayCount + 1);
      setIsPraying(false);
      setTimeLeft(0);
      await prayController.createPray(
        user?.id || "",
        currentPrayCard?.id || ""
      );
    }
  };

  // Start the prayer timer using requestAnimationFrame
  const startPrayer = () => {
    setIsPraying(true);
    setTimeLeft(prayDuration);
    setProgress(0);

    // Reset animation references
    startTimeRef.current = 0;
    lastUpdateRef.current = 0;

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Start smooth animation
    animationRef.current = requestAnimationFrame(animate);
  };

  // Cleanup the animation when the component unmounts
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center h-24 justify-center">
        {!isPraying ? (
          <button
            onClick={startPrayer}
            disabled={hasPrayedToday || !currentPrayCard}
            className={`${
              hasPrayedToday || !currentPrayCard
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            } text-white font-medium py-3 px-6 rounded-lg shadow-md flex items-center space-x-2 transition-all transform ${
              !hasPrayedToday && currentPrayCard ? "hover:scale-105" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span>{hasPrayedToday ? "오늘 기도완료" : "기도하기"}</span>
          </button>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative h-24 w-24 flex items-center justify-center">
              {/* Background circle */}
              <svg className="absolute" width="100" height="100">
                <circle
                  cx="50"
                  cy="50"
                  r={circleRadius}
                  fill="transparent"
                  stroke="#E5E7EB" // gray-200
                  strokeWidth="8"
                />
              </svg>

              {/* Progress circle - super smooth continuous animation */}
              <svg className="absolute" width="100" height="100">
                <circle
                  cx="50"
                  cy="50"
                  r={circleRadius}
                  fill="transparent"
                  stroke="#2563EB" // blue-600
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={
                    circumference - (progress / 100) * circumference
                  }
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>

              {/* Time display */}
              <div className="text-2xl font-bold text-gray-700">{timeLeft}</div>
            </div>
          </div>
        )}
      </div>
      {/* Add prayer count info */}
      <div className="w-full max-w-md text-center mt-2">
        <p className="text-sm text-gray-500">
          이번주 기도한 횟수:{" "}
          <span className="font-medium text-blue-600">{prayCount}회</span>
        </p>
      </div>
    </div>
  );
};

export default PrayerTimerButton;
