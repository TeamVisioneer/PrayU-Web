import { Button } from "@/components/ui/button";
import React from "react";
import { Link } from "react-router-dom";

const GroupNotFoundPage: React.FC = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center gap-4">
      <h1 className="font-bold text-xl">그룹 페이지 문의</h1>
      <div className="text-center text-gray-500">
        <p>그룹을 찾을 수 없어요😂</p>
        <p>문제가 반복된다면 문의하기를 진행해 주세요</p>
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

export default GroupNotFoundPage;
