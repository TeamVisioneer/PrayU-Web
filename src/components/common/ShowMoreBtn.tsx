import { ClipLoader } from "react-spinners";
import { IoChevronDown } from "react-icons/io5";

interface ShowMoreBtnProps {
  isLoading: boolean;
  onClick: () => void;
}

const ShowMoreBtn = ({ isLoading, onClick }: ShowMoreBtnProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-mainBtn transition-all duration-200 rounded-xl px-6 py-3 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {!isLoading ? (
        <>
          <span className="font-medium text-sm text-gray-700">더보기</span>
          <IoChevronDown size={14} className="text-gray-500" />
        </>
      ) : (
        <ClipLoader color="#70AAFF" size={16} />
      )}
    </button>
  );
};

export default ShowMoreBtn;
