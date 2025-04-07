import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import GroupMenuBtn from "@/components/group/GroupMenuBtn";

const PrayCardHeader = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header className="sticky top-0 z-50 flex items-center p-4 border-b bg-mainBg">
      <button onClick={handleBack} className="absolute left-4">
        <IoChevronBack size={20} />
      </button>
      <h1 className="text-lg font-bold w-full text-center">기도카드 만들기</h1>
      <div className="absolute right-4">
        <GroupMenuBtn />
      </div>
    </header>
  );
};

export default PrayCardHeader;
