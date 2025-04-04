import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MdDragIndicator } from "react-icons/md";
import { Reorder } from "framer-motion";

interface NewPrayCardRequestStepProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const NewPrayCardRequestStep: React.FC<NewPrayCardRequestStepProps> = ({
  value,
  onChange,
  onNext,
  onPrev,
}) => {
  const maxLength = 100;
  console.log(value);

  const [prayRequests, setPrayRequests] = useState<string[]>(
    value.split("\n").filter((request) => request.trim() !== "")
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const isValid = prayRequests.length > 0;

  const handleAddRequest = () => {
    if (currentInput.trim()) {
      let newRequests = [...prayRequests];

      if (editingIndex !== null) {
        // 기존 항목 수정
        newRequests[editingIndex] = currentInput.trim();
      } else {
        // 새 항목 추가
        newRequests = [...prayRequests, currentInput.trim()];
      }

      setPrayRequests(newRequests);
      setCurrentInput("");
      setShowAddForm(false);
      setEditingIndex(null);

      onChange(newRequests.join("\n"));
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
    onChange(newRequests.join("\n"));
  };

  if (showAddForm) {
    return (
      <div className="flex flex-col  bg-white rounded-xl shadow-sm">
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
            onChange={(e) => {
              // if (e.target.value.length <= maxLength) {
              setCurrentInput(e.target.value);
              // }
            }}
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
      <h1 className="text-lg font-bold mb-4">
        이번 주 기도제목을 작성해주세요
      </h1>

      <div className="mb-4 flex-1">
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

        <div className="text-xs text-gray-500 mb-4">
          <span className="text-blue-500 font-medium">Tip</span> 기도제목을
          클릭하면 수정할 수 있어요. 드래그하여 순서를 변경할 수도 있어요!
        </div>

        <div className="h-80 overflow-y-auto">
          {prayRequests.length > 0 ? (
            <Reorder.Group
              axis="y"
              values={prayRequests}
              onReorder={(newRequests) => {
                setPrayRequests(newRequests);
                onChange(newRequests.join("\n"));
              }}
              className="space-y-2"
            >
              {prayRequests.map((request, index) => (
                <Reorder.Item
                  key={request}
                  value={request}
                  className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 "
                >
                  <div className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-blue-500 mr-2 ">
                    <MdDragIndicator size={20} />
                  </div>
                  <p
                    className="w-full text-gray-700 text-sm py-1 cursor-pointer break-words"
                    onClick={() => handleEditRequest(index)}
                  >
                    {request}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRequest(index);
                    }}
                    className="w-6 h-6 flex-shrink-0 flex items-center justify-center text-gray-400 ml-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            <div className="text-xs text-center py-8 text-gray-400 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center">
              <p className="mt-1">기도제목을 추가해주세요</p>
              <p className="mt-1">최대 10개까지 추가할 수 있어요</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {}}
                disabled={false}
                className="text-xs text-blue-500 hover:text-blue-600"
              >
                기존 내용 불러오기
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-auto">
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
      </div>
    </div>
  );
};

export default NewPrayCardRequestStep;
