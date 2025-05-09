import React from "react";
import { MdDragIndicator } from "react-icons/md";

interface ExamplePrayRequestItemProps {
  request: string;
  onClick?: () => void;
}

const ExamplePrayRequestItem: React.FC<ExamplePrayRequestItemProps> = ({
  request,
  onClick,
}) => {
  return (
    <div
      className="flex items-center p-3 bg-white/70 rounded-lg border border-dashed border-gray-300 select-none opacity-70 hover:opacity-90 hover:border-blue-300 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="w-6 h-6 flex items-center justify-center text-gray-300 mr-2">
        <MdDragIndicator size={20} />
      </div>
      <p className="w-full text-gray-500 text-sm py-1 break-words italic">
        {request}
      </p>
      <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center text-gray-300 ml-2">
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
      </div>
    </div>
  );
};

export default ExamplePrayRequestItem;
