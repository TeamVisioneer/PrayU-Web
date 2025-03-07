import React, { useState } from "react";
import { Church } from "@/data/mockOfficeData";
import { UnionFormData } from "@/stores/officeStore";

interface UnionFormProps {
  selectedChurch: Church;
  onSubmit: (data: UnionFormData) => void;
  onCancel: () => void;
}

const UnionForm: React.FC<UnionFormProps> = ({
  selectedChurch,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState("");
  const [pastorName, setPastorName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"union" | "department">("union");
  const [nameError, setNameError] = useState("");
  const [pastorNameError, setPastorNameError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    let isValid = true;

    if (!name.trim()) {
      setNameError("워크스페이스 이름을 입력해주세요.");
      isValid = false;
    } else {
      setNameError("");
    }

    if (!pastorName.trim()) {
      setPastorNameError("담당자 이름을 입력해주세요.");
      isValid = false;
    } else {
      setPastorNameError("");
    }

    if (isValid) {
      onSubmit({
        name,
        pastorName,
        description: description.trim() ? description : undefined,
        groupType: type,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm text-blue-700">
        <p>워크스페이스는 교회 내에서 함께 활동하는 그룹을 의미합니다.</p>
        <p>
          소그룹, 셀, 목장, 부서, 사역팀 등 어떤 형태든 새 워크스페이스를 만들
          수 있습니다.
        </p>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium">선택한 교회:</span>{" "}
          {selectedChurch.name}
        </p>
        {selectedChurch.address && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">주소:</span> {selectedChurch.address}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          워크스페이스 유형
        </label>
        <div className="flex space-x-3">
          <label className="flex items-center">
            <input
              type="radio"
              value="union"
              checked={type === "union"}
              onChange={() => setType("union")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">
              소그룹 (셀, 목장 등)
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="department"
              checked={type === "department"}
              onChange={() => setType("department")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">
              부서 (사역팀, 위원회 등)
            </span>
          </label>
        </div>
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          워크스페이스 이름*
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 청년부, 주일학교, 새가족부, 찬양팀"
          className={`w-full px-3 py-2 border ${
            nameError ? "border-red-500" : "border-gray-300"
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
        />
        {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
      </div>

      <div>
        <label
          htmlFor="pastorName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          담당자 이름*
        </label>
        <input
          type="text"
          id="pastorName"
          value={pastorName}
          onChange={(e) => setPastorName(e.target.value)}
          placeholder="워크스페이스를 담당하는 사역자 또는 리더의 이름"
          className={`w-full px-3 py-2 border ${
            pastorNameError ? "border-red-500" : "border-gray-300"
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
        />
        {pastorNameError && (
          <p className="mt-1 text-sm text-red-600">{pastorNameError}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          워크스페이스 설명 (선택)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="워크스페이스에 대한 간단한 설명을 입력하세요"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
        >
          워크스페이스 생성
        </button>
      </div>
    </form>
  );
};

export default UnionForm;
