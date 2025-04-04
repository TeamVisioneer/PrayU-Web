import React, { useEffect, useState } from "react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  const [animatedStep, setAnimatedStep] = useState(currentStep);

  // Generate array from 0 to totalSteps-1
  const steps = Array.from({ length: totalSteps }, (_, i) => i);

  // Set up animation on step change
  useEffect(() => {
    if (currentStep > animatedStep) {
      // Animate forward - immediately match current step
      setAnimatedStep(currentStep);
    } else if (currentStep < animatedStep) {
      // Animate backward - immediately match current step
      setAnimatedStep(currentStep);
    }
  }, [currentStep, animatedStep]);

  return (
    <div className="px-6 pt-6">
      <div className="flex w-full">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            {/* Step segment */}
            <div className="flex-1 h-1 bg-gray-200 rounded-sm overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all ease-out"
                style={{
                  width:
                    step < animatedStep
                      ? "100%"
                      : step === animatedStep
                      ? "100%"
                      : "0%",
                  transitionDuration: step === animatedStep ? "600ms" : "300ms",
                  transitionDelay:
                    step === animatedStep ? `${index * 100}ms` : "0ms",
                }}
              />
            </div>

            {/* Add a small gap between segments, except after the last one */}
            {index < steps.length - 1 && <div className="w-1" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
