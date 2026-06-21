import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";

interface PrayCardHeaderProps {
  // 상단 뒤로가기 동작 커스터마이즈. 미지정 시 history 한 칸 뒤로 이동.
  onBack?: () => void;
}

const PrayCardHeader = ({ onBack }: PrayCardHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(-1);
  };

  return (
    <header className="sticky top-0 z-50 flex items-center p-4 border-b bg-mainBg">
      <button onClick={handleBack} className="absolute left-4">
        <IoChevronBack size={20} />
      </button>
      <h1 className="text-lg font-bold w-full text-center">기도카드 만들기</h1>
    </header>
  );
};

export default PrayCardHeader;
