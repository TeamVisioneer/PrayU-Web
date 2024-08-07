import { Button } from "../ui/button";

const GroupLimitBtn: React.FC = () => {
  return (
    <Button
      variant="primary"
      onClick={() => {
        window.open(`${import.meta.env.VITE_PRAY_KAKAO_CHANNEL_CHAT_URL}`);
      }}
    >
      문의하기
    </Button>
  );
};

export const GroupLimitCard = () => {
  const maxGroupCount = Number(import.meta.env.VITE_MAX_GROUP_COUNT);
  return (
    <div className="flex flex-col justify-center items-center gap-4 p-4 border rounded-lg shadow-prayCard bg-white ">
      <h1 className="font-bold text-xl">그룹 개수 문의</h1>
      <div className="text-center text-gray-500">
        <p>{maxGroupCount}개 이상의 그룹 참여는</p>
        <p>문의하기를 통해 진행해주세요</p>
      </div>
      <GroupLimitBtn />
    </div>
  );
};

export default GroupLimitCard;
