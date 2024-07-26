import { Button } from "../ui/button";

const PrayEncourageBtn: React.FC = () => {
  return (
    // kakao share button 사용
    <Button
      className="className= 
        flex flex-col justify-center w-40 h-12
        bg-blue-950 text-white
        rounded cursor-pointer"
      asChild
    >
      <a>카카오톡 버튼으로 수정할 것임</a>
    </Button>
  );
};

export default PrayEncourageBtn;
