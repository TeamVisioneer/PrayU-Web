import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import useBaseStore from "@/stores/baseStore";
import { Group } from "supabase/types/tables";
import GroupTagList from "../group/GroupTagList";
import { motion } from "framer-motion";
import { bulkCreatePrayCard } from "@/apis/prayCard";
import { PulseLoader } from "react-spinners";
import { analyticsTrack } from "@/analytics/analytics";

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
  const bulkUpdateMembers = useBaseStore((state) => state.bulkUpdateMembers);
  const myMemberList = useBaseStore((state) => state.myMemberList);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePrayCard = async () => {
    analyticsTrack("클릭_기도카드생성_만들기", { where: "그룹선택" });
    setIsCreating(true);
    if (!user) {
      setIsCreating(false);
      return;
    }
    const prayCardContent = localStorage.getItem("prayCardContent") || "";
    const prayCardLife = localStorage.getItem("prayCardLife") || "";
    const prayCardList = await bulkCreatePrayCard(
      selectedGroups.map((group) => group.id),
      user.id,
      prayCardContent,
      prayCardLife
    );

    // 멤버 정보를 bulk로 업데이트
    const selectedGroupIds = selectedGroups.map((g) => g.id);
    const selectedMemberIds = myMemberList
      ?.filter((member) => selectedGroupIds.includes(member.group_id as string))
      .map((member) => member.id);

    if (selectedMemberIds && selectedMemberIds.length > 0) {
      await bulkUpdateMembers(selectedMemberIds, prayCardContent, true);
    }

    if (prayCardList) {
      localStorage.removeItem("prayCardContent");
      localStorage.removeItem("prayCardLife");
      onNext();
    }
    setIsCreating(false);
  };

  const handleGroupToggle = (group: Group) => {
    analyticsTrack("클릭_기도카드생성_그룹선택", {
      where: "그룹선택",
      group_name: group.name,
    });
    const isSelected = selectedGroups.some((g) => g.id === group.id);

    if (isSelected) {
      // Remove the group if already selected
      onGroupSelect(selectedGroups.filter((g) => g.id !== group.id));
    } else {
      // Add the group if not already selected
      onGroupSelect([...selectedGroups, group]);
    }
  };

  const handlePrevClick = () => {
    analyticsTrack("클릭_기도카드생성_이전", { where: "그룹선택" });
    onPrev();
  };

  const handleNewGroupClick = () => {
    analyticsTrack("클릭_기도카드생성_새그룹생성", { where: "그룹선택" });
    window.location.href = "/group/new";
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
            groupList={myMemberList?.map((member) => member.group) || []}
            selectedGroups={selectedGroups}
            onGroupToggle={handleGroupToggle}
            loading={Boolean(!myMemberList)}
            emptyMessage={
              <div className="flex flex-col justify-center items-center">
                <p className="text-sm text-gray-500">
                  참여 중인 그룹이 없습니다
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNewGroupClick}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  새 그룹 만들기
                </Button>
              </div>
            }
          />
        </div>
      </motion.div>

      <motion.div className="flex flex-col gap-2" variants={itemVariants}>
        <Button
          onClick={() => handleCreatePrayCard()}
          className="flex-1 py-4 text-base bg-blue-500 hover:bg-blue-600"
          disabled={
            selectedGroups.length === 0 &&
            myMemberList?.length !== 0 &&
            isCreating
          }
        >
          {isCreating ? (
            <PulseLoader size={10} color="#f3f4f6" />
          ) : (
            "기도카드 만들기"
          )}
        </Button>
        <Button
          onClick={handlePrevClick}
          variant="outline"
          className="flex-1 py-4 text-base"
        >
          이전
        </Button>
      </motion.div>
    </div>
  );
};

export default NewPrayCardGroupSelectStep;
