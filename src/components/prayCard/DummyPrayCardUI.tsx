interface DumyPrayCardProps {
  profileImage: string;
  name: string;
}

const DumyPrayCardUI: React.FC<DumyPrayCardProps> = ({
  profileImage,
  name,
}) => {
  return (
    <div className="flex flex-col flex-grow overflow-y-auto no-scrollbar bg-white rounded-2xl shadow-prayCard">
      {/* 헤더 섹션 */}
      <div className="z-30 min-h-14 px-4 my-4 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={profileImage || "/images/defaultProfileImage.png"}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              e.currentTarget.src = "/images/defaultProfileImage.png";
            }}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-lg font-medium">{name}</span>
          <span className="text-gray-400">3일 전</span>
        </div>
      </div>

      {/* 컨텐츠 섹션 */}
      <div className="flex flex-col flex-grow px-4 pb-4 overflow-y-auto no-scrollbar">
        {/* 지난 한주 섹션 */}
        <section>
          <div className="sticky top-0 py-2 flex items-center gap-1 z-20 bg-white">
            <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
              일상 나눔
            </h3>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              회사에서 업무적, 관계적으로 힘들었던 한 주
            </p>
          </div>
        </section>

        {/* 기도제목 섹션 */}
        <section className="flex flex-col flex-grow">
          <div className="sticky top-0 py-2 z-20 bg-white">
            <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
              이번 주 기도제목
            </h3>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 flex flex-col flex-grow">
            <p className="flex-grow text-sm text-gray-700 whitespace-pre-wrap">
              (예시)
              <br />
              1. 맡겨진 자리에서 하나님의 사명을 발견할 수 있도록
              <br />
              2. 내 주변 사람을 내 몸과 같이 섬길 수 있도록
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DumyPrayCardUI;
