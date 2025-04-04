import React from "react";
import PrayCard from "./PrayCard";

const PrayCardExample: React.FC = () => {
  // Sample data for demonstration
  const sampleData = {
    user: {
      id: "user123",
      name: "홍길동",
      avatarUrl: "https://i.pravatar.cc/300?img=1",
    },
    lifeShare:
      "이번 주는 정말 바쁜 한 주였습니다. 회사에서 새로운 프로젝트가 시작되어 야근을 많이 했지만, 그래도 매일 아침 QT를 통해 힘을 얻었습니다.",
    prayContent:
      "새로운 프로젝트를 지혜롭게 잘 진행할 수 있도록 기도해주세요.\n부모님의 건강을 위해 기도합니다.\n교회 봉사활동을 통해 많은 분들께 도움이 되기를 원합니다.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-lg font-bold mb-4">기도카드 예시</h2>
      <PrayCard
        user={sampleData.user}
        lifeShare={sampleData.lifeShare}
        prayContent={sampleData.prayContent}
        createdAt={sampleData.createdAt}
      />
    </div>
  );
};

export default PrayCardExample;
