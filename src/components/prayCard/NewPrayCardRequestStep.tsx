import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Reorder, motion } from "framer-motion";
import useBaseStore from "@/stores/baseStore";
import PrayRequestItem from "./PrayRequestItem";

interface NewPrayCardRequestStepProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

// Animation variants for staggered child elements
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const NewPrayCardRequestStep: React.FC<NewPrayCardRequestStepProps> = ({
  value,
  onChange,
  onNext,
  onPrev,
}) => {
  const historyPrayCardList = useBaseStore(
    (state) => state.historyPrayCardList
  );

  const maxLength = 100;
  const [prayRequests, setPrayRequests] = useState<string[]>(
    localStorage
      .getItem("prayCardContent")
      ?.split("\n\n")
      .filter((request) => request.trim() !== "") ||
      value.split("\n\n").filter((request) => request.trim() !== "")
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const isValid = prayRequests.length > 0;

  const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxLength) {
      setCurrentInput(e.target.value);
    }
  };

  const handleAddRequest = () => {
    if (currentInput.trim()) {
      let newRequests = [...prayRequests];

      if (editingIndex !== null)
        newRequests[editingIndex] = currentInput.trim();
      else newRequests = [...prayRequests, currentInput.trim()];

      setPrayRequests(newRequests);
      setCurrentInput("");
      setShowAddForm(false);
      setEditingIndex(null);

      onChange(newRequests.join("\n\n"));
      localStorage.setItem("prayCardContent", newRequests.join("\n\n"));
    }
  };

  const handleEditRequest = (index: number) => {
    setCurrentInput(prayRequests[index]);
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const handleDeleteRequest = (index: number) => {
    const newRequests = prayRequests.filter((_, i) => i !== index);
    setPrayRequests(newRequests);
    onChange(newRequests.join("\n\n"));
    localStorage.setItem("prayCardContent", newRequests.join("\n\n"));
  };

  const handleReorderPrayRequest = (newRequests: string[]) => {
    setPrayRequests(newRequests);
    onChange(newRequests.join("\n\n"));
    localStorage.setItem("prayCardContent", newRequests.join("\n\n"));
  };

  const handleLoadPreviousPrayRequest = () => {
    const previousPrayRequest = historyPrayCardList?.[0]?.content;
    const previousPrayRequests = previousPrayRequest?.split("\n\n");
    if (previousPrayRequests) {
      setPrayRequests(previousPrayRequests);
      localStorage.setItem(
        "prayCardContent",
        previousPrayRequests.join("\n\n")
      );
    }
  };

  if (showAddForm) {
    return (
      <div className="flex flex-col bg-white rounded-xl shadow-sm">
        <div className="flex justify-between items-center p-4 border-b">
          <button
            onClick={() => {
              setShowAddForm(false);
              setEditingIndex(null);
              setCurrentInput("");
            }}
            className="text-gray-500 font-medium"
          >
            취소
          </button>
          <button
            onClick={handleAddRequest}
            disabled={!currentInput.trim()}
            className={`font-medium ${
              currentInput.trim() ? "text-blue-500" : "text-gray-300"
            }`}
          >
            {editingIndex !== null ? "수정하기" : "추가하기"}
          </button>
        </div>

        <div className="h-40 p-4">
          <Textarea
            placeholder="기도제목을 입력하세요"
            className="h-full w-full overflow-y-auto resize-none text-base border-0 focus:ring-0 p-0 placeholder:text-gray-300 text-gray-800 mb-6"
            value={currentInput}
            onChange={(e) => handleOnChange(e)}
            autoFocus
          />
        </div>
        <div className="p-4 text-xs text-gray-400 text-right">
          {currentInput.length}/{maxLength}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <motion.div
        className="flex justify-between items-center mb-2"
        variants={itemVariants}
      >
        <motion.h1 className="text-lg font-bold" variants={itemVariants}>
          이번 주 기도제목을 작성해주세요
        </motion.h1>
      </motion.div>

      <motion.div
        className="flex flex-col flex-1 overflow-hidden"
        variants={itemVariants}
      >
        <motion.div variants={itemVariants}>
          <Button
            onClick={() => {
              setEditingIndex(null);
              setCurrentInput("");
              setShowAddForm(true);
            }}
            className="w-full bg-white hover:bg-gray-50 text-gray-500 mb-4 flex justify-start items-center border border-gray-200 shadow-sm p-3 h-auto rounded-lg"
          >
            <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <span className="text-gray-400">새 기도제목 추가하기</span>
          </Button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="text-xs text-gray-500 mb-4">
            <span className="text-blue-500 font-medium">Tip</span> 기도제목을
            클릭하면 수정할 수 있어요. 드래그하여 순서를 변경할 수도 있어요!
          </div>
        </motion.div>

        <motion.div
          className="overflow-y-auto flex-1 min-h-0 pb-5"
          variants={itemVariants}
        >
          {prayRequests.length > 0 ? (
            <Reorder.Group
              axis="y"
              values={prayRequests}
              onReorder={handleReorderPrayRequest}
              layoutScroll
              className="space-y-2"
            >
              {prayRequests.map((request, index) => (
                <PrayRequestItem
                  key={request}
                  request={request}
                  index={index}
                  onEdit={handleEditRequest}
                  onDelete={handleDeleteRequest}
                />
              ))}
            </Reorder.Group>
          ) : (
            <div className="text-xs text-center py-8 text-gray-400 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center">
              <p className="mt-1">기도제목을 추가해주세요</p>
              <p className="mt-1">최대 10개까지 추가할 수 있어요</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLoadPreviousPrayRequest()}
                disabled={!historyPrayCardList}
                className="text-xs text-blue-500 hover:text-blue-600"
              >
                기존 내용 불러오기
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>

      <motion.div className="flex gap-2 mt-5" variants={itemVariants}>
        <Button
          onClick={onPrev}
          variant="outline"
          className="flex-1 py-6 text-base"
        >
          이전
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
          className={`flex-1 py-6 text-base ${
            isValid
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          다음
        </Button>
      </motion.div>
    </div>
  );
};

export default NewPrayCardRequestStep;
