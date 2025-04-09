import React from "react";
import { MdDragIndicator } from "react-icons/md";
import { Reorder, useDragControls } from "framer-motion";

interface PrayRequestItemProps {
  request: string;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const PrayRequestItem: React.FC<PrayRequestItemProps> = ({
  request,
  index,
  onEdit,
  onDelete,
}) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      key={request}
      value={request}
      drag="y"
      dragListener={false}
      dragControls={dragControls}
      onPointerDown={(e: React.PointerEvent) => {
        e.preventDefault();
        dragControls.start(e);
      }}
      style={{ touchAction: "none" }}
      className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 select-none active:text-blue-500"
    >
      <div className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-blue-500 mr-2 cursor-grab active:cursor-grabbing active:text-blue-500">
        <MdDragIndicator size={20} />
      </div>
      <p
        className="w-full text-gray-700 text-sm py-1 cursor-pointer break-words"
        onClick={() => onEdit(index)}
      >
        {request}
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(index);
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
  );
};

export default PrayRequestItem;
