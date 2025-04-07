import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import useBaseStore from "@/stores/baseStore";
import { Group } from "supabase/types/tables";
import GroupTagList from "../group/GroupTagList";
import { motion } from "framer-motion";

interface NewPrayCardGroupSelectStepProps {
  selectedGroups: Group[];
  onGroupSelect: (groups: Group[]) => void;
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

const NewPrayCardGroupSelectStep: React.FC<NewPrayCardGroupSelectStepProps> = ({
  selectedGroups,
  onGroupSelect,
  onNext,
  onPrev,
}) => {
  const user = useBaseStore((state) => state.user);
  const groupList = useBaseStore((state) => state.groupList);
  const fetchGroupListByUserId = useBaseStore(
    (state) => state.fetchGroupListByUserId
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGroups = async () => {
      if (user) {
        setLoading(true);
        await fetchGroupListByUserId(user.id);
        setLoading(false);
      }
    };

    loadGroups();
  }, [user, fetchGroupListByUserId]);

  const isNextEnabled = selectedGroups.length > 0;

  const handleGroupToggle = (group: Group) => {
    const isSelected = selectedGroups.some((g) => g.id === group.id);

    if (isSelected) {
      // Remove the group if already selected
      onGroupSelect(selectedGroups.filter((g) => g.id !== group.id));
    } else {
      // Add the group if not already selected
      onGroupSelect([...selectedGroups, group]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <motion.h1 className="text-xl font-bold mb-4" variants={itemVariants}>
        기도카드를 올릴 그룹 선택
      </motion.h1>

      <motion.div
        className="bg-gray-50 rounded-lg p-4 mb-6"
        variants={itemVariants}
      >
        <div className="flex items-start gap-2">
          <div className="mt-0.5 text-blue-500 flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="text-sm text-gray-600">
            선택한 그룹에 각각 기도카드가 생성됩니다.
            <br />각 그룹에 생성된 기도카드는 이후 수정이 가능해요!
          </div>
        </div>
      </motion.div>

      <motion.div
        className="flex-1 mb-4 overflow-hidden"
        variants={itemVariants}
      >
        <div className="h-full max-h-[350px] overflow-y-auto">
          <GroupTagList
            groupList={groupList || []}
            selectedGroups={selectedGroups}
            onGroupToggle={handleGroupToggle}
            loading={loading}
            emptyMessage={
              <div className="flex flex-col justify-center items-center">
                <p className="text-gray-500 mb-2">참여 중인 그룹이 없습니다</p>
                <Button
                  onClick={() => (window.location.href = "/group/new")}
                  variant="outline"
                  className="text-sm"
                >
                  새 그룹 만들기
                </Button>
              </div>
            }
          />
        </div>
      </motion.div>

      <motion.div className="flex gap-2 mt-auto" variants={itemVariants}>
        <Button
          onClick={onPrev}
          variant="outline"
          className="flex-1 py-6 text-base"
        >
          이전
        </Button>
        <Button
          onClick={onNext}
          disabled={!isNextEnabled}
          className={`flex-1 py-6 text-base ${
            isNextEnabled
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

export default NewPrayCardGroupSelectStep;
