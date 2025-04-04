import React from "react";
import FlippablePrayCard from "./FlippablePrayCard";

const FlippablePrayCardDemo: React.FC = () => {
  // Sample data for the demo
  const bibleVerse = {
    verse:
      "여호와여 내가 주께 대한 소문을 듣고 놀랐나이다 여호와여 주는 주의 일을 이 수년 내에 부흥케 하옵소서 이 수년 내에 나타내시옵소서 진노 중에라도 긍휼을 잊지 마옵소서",
    reference: "하박국 3:2",
  };

  const prayCardProps = {
    user: {
      id: "user123",
      name: "김성도",
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    lifeShare:
      "이번 주는 시험 기간이라 많이 힘들었지만, 새벽 기도를 통해 하나님이 주시는 평안함을 느낄 수 있었습니다.",
    prayContent:
      "1. 시험 잘 볼 수 있도록 지혜를 주세요.\n2. 건강 지켜주셔서 감사합니다.\n3. 가족 모두 건강하게 지켜주세요.",
    createdAt: new Date(),
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">3D 기도카드 예시</h2>
      <div className="max-w-sm mx-auto">
        <FlippablePrayCard
          bibleVerse={bibleVerse}
          prayCardProps={prayCardProps}
        />
      </div>
      <p className="text-sm text-gray-500 text-center mt-4">
        카드를 탭하면 앞면/뒷면이 전환됩니다
      </p>
    </div>
  );
};

export default FlippablePrayCardDemo;
