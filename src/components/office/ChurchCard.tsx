import React from "react";
import { Church } from "@/data/mockOfficeData";

interface ChurchCardProps {
  church: Church;
  onClick?: () => void;
  showAddButton?: boolean;
  onAddClick?: () => void;
  isAdded?: boolean;
}

const ChurchCard: React.FC<ChurchCardProps> = ({
  church,
  onClick,
  showAddButton = false,
  onAddClick,
  isAdded = false,
}) => {
  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddClick) onAddClick();
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden mb-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="flex">
        <div className="w-24 h-24 bg-gray-200 flex-shrink-0">
          {church.imageUrl ? (
            <img
              src={church.imageUrl}
              alt={church.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
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
            </div>
          )}
        </div>
        <div className="p-4 flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{church.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{church.address}</p>
              <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500">
                <span>목사: {church.pastor}</span>

                {church.externalData?.denomination && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{church.externalData.denomination}</span>
                  </>
                )}

                {church.externalData?.phone && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{church.externalData.phone}</span>
                  </>
                )}

                {!church.externalData && (
                  <>
                    <span className="mx-2">•</span>
                    <span>교인 수: {church.memberCount}명</span>
                  </>
                )}
              </div>
            </div>
            {showAddButton && (
              <button
                onClick={handleAddClick}
                className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                  isAdded
                    ? "bg-gray-200 text-gray-600 cursor-default"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                disabled={isAdded}
              >
                {isAdded ? "추가됨" : "추가"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChurchCard;
