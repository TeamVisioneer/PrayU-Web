import useBaseStore from "@/stores/baseStore";
import { getDateDistance } from "@toss/date";
import { getISOOnlyDate, getISOTodayDate } from "@/lib/utils";
import { analyticsTrack } from "@/analytics/analytics";
import MyPrayCardMenuBtn from "./MyPrayCardMenuBtn";
import { useNavigate } from "react-router-dom";
import { PrayCardWithProfiles } from "supabase/types/tables";
import { Skeleton } from "../ui/skeleton";
import { UserProfile } from "../profile/MyProfile";
interface MyPrayCardUIProps {
  prayCard?: PrayCardWithProfiles;
}

const MyPrayCardUI: React.FC<MyPrayCardUIProps> = ({ prayCard }) => {
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
    <div className="flex flex-col flex-grow mx-8 overflow-y-auto no-scrollbar bg-white rounded-2xl shadow-prayCard">
      {/* 헤더 섹션 */}
      <div className="sticky top-0 p-4 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserProfile imgSize="w-7 h-7" fontSize="text-sm font-medium" />
          <span className="text-xs text-gray-500 font-thin">
            {getDateText(dateDistance.days)}
          </span>
        </div>
        <MyPrayCardMenuBtn
          handleEditClick={() => handleEditClick()}
          prayCard={prayCard}
        />
      </div>

      {/* 컨텐츠 섹션 */}
      <div className="px-4 pb-4 space-y-2" onClick={() => handleEditClick()}>
        {/* 지난 한주 섹션 */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600 flex items-center gap-2">
            지난 한 주
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            {prayCard.content ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {prayCard.content}
              </p>
            ) : (
              <p className="text-sm text-gray-400 whitespace-pre-wrap">
                ✏️ 최근 겪고 있는 상황을 나눠주세요!
              </p>
            )}
          </div>
        </div>

        {/* 기도제목 섹션 */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600 flex items-center gap-2">
            이번 주 기도제목
            {/* <span className="text-xs text-gray-400 font-normal">
              (함께 기도할 제목들)
            </span> */}
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
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
          <p className="text-xs text-end text-gray-400 mt-2">(편집됨)</p>
        )}
      </div>
    </div>
  );
};

export default MyPrayCardUI;
