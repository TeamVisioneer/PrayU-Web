import { Button } from "../ui/button";

const LimitGroupBtn: React.FC = () => {
  return (
    <Button
      className="className= 
        flex flex-col justify-center w-40 h-12
        bg-blue-950 text-white
        rounded cursor-pointer"
      asChild
    >
      <a href={`${import.meta.env.VITE_PRAY_KAKAO_CHANNEL_CHAT_URL}`}>
        문의하기
      </a>
    </Button>
  );
};

export default LimitGroupBtn;
