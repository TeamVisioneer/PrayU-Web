import React from "react";
import { Link } from "react-router-dom"; // react-router-dom을 사용하여 링크를 처리

const GroupNotFoundPage: React.FC = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center gap-2">
      <div>그룹을 찾을 수 없어요😂</div>
      <Link to="/" className="text-sm underline text-gray-400">
        PrayU 홈으로
      </Link>
    </div>
  );
};

export default GroupNotFoundPage;
