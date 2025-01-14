import { ClipLoader } from "react-spinners";
import Vector from "@/assets/Vector.png";

interface ShowMoreBtnProps {
  isLoading: boolean;
  onClick: () => void;
}

const ShowMoreBtn = ({ isLoading, onClick }: ShowMoreBtnProps) => {
  return (
    <div
      onClick={onClick}
      className="w-fit flex flex-grow justify-center items-center bg-[#DEDFF1] rounded-xl pt-1 pb-1 px-4"
    >
      {!isLoading ? (
        <div className="flex flex-row">
          <span className="font-semibold text-sm">더보기</span>
          <div className="flex flex-col flex-grow items-center justify-center h-auto">
            <img
              className="h-[0.3rem] w-auto ml-2"
              src={Vector}
              alt="Not Prayed"
            />
          </div>
        </div>
      ) : (
        <ClipLoader color="#70AAFF" size={10} />
      )}
    </div>
  );
};

export default ShowMoreBtn;
