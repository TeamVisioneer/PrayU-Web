interface DumyPrayCardProps {
  profileImage: string;
  name: string;
  content: string;
}

const DumyPrayCardUI: React.FC<DumyPrayCardProps> = ({
  profileImage,
  name,
  content,
}) => {
  return (
    <div className="flex flex-col flex-grow overflow-y-auto no-scrollbar bg-white rounded-2xl shadow-prayCard">
      {/* 헤더 섹션 */}
      <div className="sticky top-0 p-4 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={profileImage || "/images/defaultProfileImage.png"}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              e.currentTarget.src = "/images/defaultProfileImage.png";
            }}
            className="w-7 h-7 rounded-full object-cover"
          />
          <p className="text-base font-medium">{name}</p>
          <span className="text-xs text-gray-500 font-thin">3일 전</span>
        </div>
      </div>

      {/* 컨텐츠 섹션 */}
      <div className="px-4 pb-4 space-y-2">
        {/* 지난 한주 섹션 */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600 flex items-center gap-2">
            지난 한 주
            <span className="text-xs text-gray-400 font-normal">
              (최근 겪고 있는 상황)
            </span>
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {/* {content} */}
            </p>
          </div>
        </div>

        {/* 기도제목 섹션 */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600 flex items-center gap-2">
            이번 주 기도제목
            <span className="text-xs text-gray-400 font-normal">
              (함께 기도할 제목들)
            </span>
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DumyPrayCardUI;
