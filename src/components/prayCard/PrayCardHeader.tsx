import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";

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

  return <PageHeader title="기도카드 만들기" onBack={handleBack} />;
};

export default PrayCardHeader;
