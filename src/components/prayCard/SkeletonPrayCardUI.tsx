import { Skeleton } from "../ui/skeleton";

const SkeletonPrayCardUI: React.FC = () => {
  return (
    <div className="flex flex-col flex-grow overflow-y-auto no-scrollbar bg-white rounded-2xl shadow-prayCard">
      {/* 헤더 섹션 */}
      <div className="sticky top-0 p-4 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-full" />
          <Skeleton className="w-16 h-4 rounded-full" />
        </div>
      </div>

      {/* 컨텐츠 섹션 */}
      <div className="px-4 pb-4 space-y-2">
        {/* 지난 한주 섹션 */}
        <div className="space-y-2">
          <Skeleton className="w-32 h-4 rounded-full" />
          <Skeleton className="bg-gray-50 h-32 rounded-lg p-4" />
        </div>

        {/* 기도제목 섹션 */}
        <div className="space-y-2">
          <Skeleton className="w-32 h-4 rounded-full" />
          <Skeleton className="bg-gray-50 h-32 rounded-lg p-4" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonPrayCardUI;
