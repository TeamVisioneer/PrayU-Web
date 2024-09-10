import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const GroupLimitPage: React.FC = () => {
  const maxGroupCount = Number(import.meta.env.VITE_MAX_GROUP_COUNT);

  return (
    <div className="h-screen flex flex-col justify-center items-center gap-4">
      <h1 className="font-bold text-xl">그룹 개수 문의</h1>
      <div className="text-center text-gray-500">
        <p>{maxGroupCount}개 이상의 그룹 참여는</p>
        <p>문의하기를 통해 진행해주세요</p>
      </div>
      <Button
        variant="primary"
        className="w-32"
        onClick={() => {
          window.open(`${import.meta.env.VITE_PRAY_KAKAO_CHANNEL_CHAT_URL}`);
        }}
      >
        문의하기
      </Button>
      <Link to="/group" className="text-sm underline text-gray-400">
        기존 그룹 바로가기
      </Link>
    </div>
  );
};

export default GroupLimitPage;
