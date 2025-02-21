import useBaseStore from "@/stores/baseStore";
import { getDateDistance } from "@toss/date";
import { getISOOnlyDate, getISOTodayDate } from "@/lib/utils";
import { analyticsTrack } from "@/analytics/analytics";
import MyPrayCardMenuBtn from "./MyPrayCardMenuBtn";
import { useNavigate } from "react-router-dom";
import { PrayCardWithProfiles } from "supabase/types/tables";
import { Skeleton } from "../ui/skeleton";
import { UserProfile } from "../profile/MyProfile";
import InfoBtn from "../alert/infoBtn";
interface MyPrayCardUIProps {
  prayCard?: PrayCardWithProfiles | null;
  isHistoryView?: boolean;
}

const MyPrayCardUI: React.FC<MyPrayCardUIProps> = ({
  prayCard,
  isHistoryView,
}) => {
  const navigate = useNavigate();
  const targetGroup = useBaseStore((state) => state.targetGroup);

  if (!prayCard) {
    return <Skeleton className="flex-grow bg-gray-200 rounded-xl" />;
  }

  const dateDistance = getDateDistance(
    new Date(getISOOnlyDate(prayCard.created_at)),
    new Date(getISOTodayDate())
  );

  const getDateText = (days: number) => {
    if (days === 0) return "오늘";
    if (days === 1) return "어제";
    return `${days}일 전`;
  };

  const handleEditClick = () => {
    if (!targetGroup) return;
    navigate(`/group/${targetGroup.id}/praycard/${prayCard.id}/edit`);
    analyticsTrack("클릭_기도카드_수정", {});
  };

  return (
    <div className="flex flex-col flex-grow overflow-y-auto no-scrollbar bg-white rounded-2xl shadow-prayCard">
      {/* 헤더 섹션 */}
      <div className="sticky top-0 z-30 h-14 p-4 bg-white flex items-center justify-between border-b transform-gpu">
        <div className="flex items-center gap-2">
          <UserProfile imgSize="w-7 h-7" fontSize="text-sm font-medium" />
          <span className="text-xs text-gray-500 font-thin">
            {getDateText(dateDistance.days)}
          </span>
        </div>
        <MyPrayCardMenuBtn
          handleEditClick={isHistoryView ? undefined : handleEditClick}
          prayCard={prayCard}
        />
      </div>

      {/* 컨텐츠 섹션 */}
      <div className="flex flex-col gap-6 px-4 pb-4">
        {/* 지난 한주 섹션 */}
        <div className="relative">
          <div className="sticky flex items-center gap-1 top-14 z-20 bg-white transform-gpu -mt-2 pt-2">
            <h3 className="py-2 text-sm font-medium text-gray-600 flex items-center gap-2">
              지난 한 주
            </h3>
            <InfoBtn
              text={[
                "기도카드에 <지난 한 주> 항목이 추가되었어요!",
                "기도제목보다 가벼운 일상을 나눠보세요 🙂",
              ]}
              eventOption={{ where: "PrayCardEditPage" }}
              position="start"
            />
          </div>
          <div
            className="bg-gray-50 rounded-lg p-4 mt-2"
            onClick={() => handleEditClick()}
          >
            {prayCard.life ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {prayCard.life}
              </p>
            ) : (
              <p className="text-sm text-gray-400 whitespace-pre-wrap">
                ✏️ 최근 겪고 있는 상황을 나눠주세요!
              </p>
            )}
          </div>
        </div>

        {/* 기도제목 섹션 */}
        <div className="relative">
          <div className="sticky top-14 z-20 bg-white transform-gpu -mt-2 pt-2">
            <h3 className="py-2 text-sm font-medium text-gray-600 flex items-center gap-2">
              이번 주 기도제목
            </h3>
          </div>
          <div
            className="bg-gray-50 rounded-lg p-4 mt-2"
            onClick={() => handleEditClick()}
          >
            {prayCard.content ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {prayCard.content}
              </p>
            ) : (
              <p className="text-sm text-gray-400 whitespace-pre-wrap">
                ✏️ 공동체에서 함께 기도할 제목을 작성해 주세요!
              </p>
            )}
          </div>
        </div>

        {/* 하단 정보 */}
        {prayCard.updated_at == prayCard.created_at && (
          <p className="text-xs text-end text-gray-400">(편집됨)</p>
        )}
      </div>
    </div>
  );
};

export default MyPrayCardUI;
