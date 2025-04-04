import React from "react";
import { Group } from "supabase/types/tables";

interface GroupTagListProps {
  groupList: Group[];
  selectedGroups: Group[];
  onGroupToggle: (group: Group) => void;
  loading?: boolean;
  emptyMessage?: React.ReactNode;
}

const GroupTagList: React.FC<GroupTagListProps> = ({
  groupList,
  selectedGroups,
  onGroupToggle,
  loading = false,
  emptyMessage,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <p className="text-gray-500">그룹 목록을 불러오는 중...</p>
      </div>
    );
  }

  if (!groupList || groupList.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-32">
        {emptyMessage || (
          <p className="text-gray-500">참여 중인 그룹이 없습니다</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {groupList.map((group) => {
        const isSelected = selectedGroups.some((g) => g.id === group.id);
        return (
          <div
            key={group.id}
            className={`cursor-pointer px-3 py-2 rounded-full flex items-center gap-2 transition-colors ${
              isSelected
                ? "bg-blue-100 border border-blue-300"
                : "bg-gray-100 border border-gray-200"
            }`}
            onClick={() => onGroupToggle(group)}
          >
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
              {group?.name ? [...group.name][0] : ""}
            </div>
            <span className="font-medium text-sm">{group.name}</span>
          </div>
        );
      })}
    </div>
  );
};

export default GroupTagList;
