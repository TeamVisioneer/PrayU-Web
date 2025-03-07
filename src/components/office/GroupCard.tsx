import React from "react";
import { Group } from "@/data/mockOfficeData";

interface GroupCardProps {
  group: Group;
  showChurchName?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  showChurchName = false,
  onClick,
  onDelete,
}) => {
  return (
    <div
      className="relative bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
      onClick={onClick}
    >
      {onDelete && (
        <button
          className="absolute top-2 right-2 p-1.5 bg-red-50 rounded-full text-red-500 hover:bg-red-100 transition-colors z-10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      <div className="flex items-center mb-2">
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center mr-2 ${
            group.groupType === "union"
              ? "bg-blue-100 text-blue-600"
              : "bg-purple-100 text-purple-600"
          }`}
        >
          {group.groupType === "union" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          )}
        </div>
        <h3 className="font-medium text-gray-900 text-base">{group.name}</h3>
      </div>

      {showChurchName && group.churchName && (
        <p className="text-xs text-gray-500 flex items-center mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          {group.churchName}
        </p>
      )}

      <div className="space-y-1.5 mb-3">
        {group.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {group.description}
          </p>
        )}

        {group.pastorName && (
          <p className="text-xs text-gray-500 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            담당: {group.pastorName}
          </p>
        )}

        {group.memberCount !== undefined && (
          <p className="text-xs text-gray-500 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            멤버: {group.memberCount}명
          </p>
        )}
      </div>

      <div className="mt-auto">
        <span
          className={`inline-block px-2 py-0.5 text-xs rounded-full ${
            group.groupType === "union"
              ? "bg-blue-100 text-blue-800"
              : "bg-purple-100 text-purple-800"
          }`}
        >
          {group.groupType === "union" ? "소그룹" : "부서"}
        </span>
      </div>
    </div>
  );
};

export default GroupCard;
