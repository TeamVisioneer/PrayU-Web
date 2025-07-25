import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import useBaseStore from "@/stores/baseStore";
import { Group } from "supabase/types/tables";
import GroupTagList from "../group/GroupTagList";
import { motion } from "framer-motion";
import { bulkCreatePrayCard } from "@/apis/prayCard";
import { PulseLoader } from "react-spinners";
import { analyticsTrack } from "@/analytics/analytics";
import { NotificationType } from "@/components/notification/NotificationType";
import { updateOnesignalUser } from "@/apis/onesignal";

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
  const getGroupWithMemberList = useBaseStore(
    (state) => state.getGroupWithMemberList
  );

  const myMemberList = useBaseStore((state) => state.myMemberList);
  const createNotification = useBaseStore((state) => state.createNotification);
  const createOnesignalPush = useBaseStore(
    (state) => state.createOnesignalPush
  );

  const [isCreating, setIsCreating] = useState(false);

  const sendNotification = async (groups: Group[], prayCardContent: string) => {
    if (!user) return;

    // 알림관련 유저 태그 업데이트
    await updateOnesignalUser({
      properties: {
        tags: { praycardCreatedAt: new Date().getTime().toString() },
      },
    });

    // 각 그룹마다 알림 전송
    for (const group of groups) {
      const subtitle = `${group.name} 기도카드 알림`;
      const message = `${prayCardContent.slice(0, 25)}...`;

      //TODO: 재시도 필요
      const groupWithMemberList = await getGroupWithMemberList(group.id);
      if (!groupWithMemberList?.member) continue;

      const memberIds: string[] = groupWithMemberList.member
        .map((member) => member.user_id)
        .filter((user_id) => user_id !== null)
        .filter((user_id) => user_id !== user.id);

      if (memberIds.length === 0) continue;

      // OneSignal 푸시 알림 전송
      await createOnesignalPush({
        title: "PrayU",
        subtitle: subtitle,
        message: message,
        data: {
          url: `${window.location.origin}/group/${group.id}`,
        },
        userIds: memberIds,
      });

      // 앱 내 알림 생성
      await createNotification({
        groupId: group.id,
        userId: memberIds,
        senderId: user.id,
        title: subtitle,
        body: message,
        type: NotificationType.SNS,
      });
    }
  };

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

    if (!selectedMemberIds || selectedMemberIds.length === 0 || !prayCardList) {
      setIsCreating(false);
      return;
    }

    await bulkUpdateMembers(selectedMemberIds, prayCardContent, true);
    await sendNotification(selectedGroups, prayCardContent);
    localStorage.removeItem("prayCardContent");
    localStorage.removeItem("prayCardLife");
    onNext();
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

      <motion.div className="flex flex-col gap-2 mb-5" variants={itemVariants}>
        <Button
          onClick={() => handleCreatePrayCard()}
          className="py-4 h-14 text-base bg-blue-500 hover:bg-blue-600"
          disabled={selectedGroups.length === 0 || isCreating}
        >
          {isCreating ? (
            <PulseLoader size={10} color="#f3f4f6" />
          ) : selectedGroups.length > 0 ? (
            <div>{selectedGroups.length}개의 그룹에 기도카드 만들기</div>
          ) : (
            <div>그룹을 선택해 주세요</div>
          )}
        </Button>
        <Button
          onClick={handlePrevClick}
          variant="outline"
          className="py-4 h-14 text-base"
        >
          이전
        </Button>
      </motion.div>
    </div>
  );
};

export default NewPrayCardGroupSelectStep;
