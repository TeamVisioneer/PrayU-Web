import React from "react";
import { Button } from "@/components/ui/button";

interface NewPrayCardIntroStepProps {
  onNext: () => void;
}

const NewPrayCardIntroStep: React.FC<NewPrayCardIntroStepProps> = ({
  onNext,
}) => {
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-bold mb-4">이번 주 기도카드 만들기</h1>
        <p className="text-gray-600">
          매주 나의 일상과 기도제목을 나누고 말씀을 받아보세요
        </p>
      </div>
      <div className="w-full">
        <Button
          onClick={onNext}
          className="w-full py-6 text-base bg-blue-500 hover:bg-blue-600"
        >
          시작하기
        </Button>
      </div>
    </div>
  );
};

export default NewPrayCardIntroStep;
