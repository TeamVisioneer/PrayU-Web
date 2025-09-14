import { ClipLoader } from "react-spinners";
import { IoChevronDown } from "react-icons/io5";

interface GroupMemberShowMoreBtnProps {
  isLoading: boolean;
  onClick: () => void;
  remainingCount?: number;
}

const GroupMemberShowMoreBtn = ({
  isLoading,
  onClick,
  remainingCount,
}: GroupMemberShowMoreBtnProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="inline-flex items-center justify-center gap-1 bg-white hover:bg-gray-50 border border-gray-200 hover:border-mainBtn transition-all duration-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed"
      aria-busy={isLoading}
    >
      {!isLoading ? (
        <>
          <span className="font-medium">
            더보기
            {typeof remainingCount === "number" && remainingCount > 0
              ? ` (${remainingCount})`
              : ""}
          </span>
          <IoChevronDown size={12} className="text-gray-500" />
        </>
      ) : (
        <ClipLoader color="#70AAFF" size={14} />
      )}
    </button>
  );
};

export default GroupMemberShowMoreBtn;
