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
  const inputPrayCardContent = useBaseStore(
    (state) => state.inputPrayCardContent
  );
  const inputPrayCardLife = useBaseStore((state) => state.inputPrayCardLife);

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
    if (isHistoryView) return;
    navigate(`/group/${targetGroup.id}/praycard/${prayCard.id}/edit`);
    analyticsTrack("클릭_기도카드_수정", {});
  };

  return (
    <div className="flex flex-col flex-grow overflow-y-auto no-scrollbar bg-white rounded-2xl shadow-prayCard">
      {/* 헤더 섹션 */}
      <div className="z-30 min-h-14 px-4 my-4 bg-white flex items-center justify-between ">
        <div className="flex items-center gap-2">
          <UserProfile imgSize="w-8 h-8" fontSize="text-lg font-medium" />
          <span className="text-gray-400">
            {getDateText(dateDistance.days)}
          </span>
        </div>
        <MyPrayCardMenuBtn
          handleEditClick={isHistoryView ? undefined : handleEditClick}
          prayCard={prayCard}
        />
      </div>

      {/* 컨텐츠 섹션 */}
      <div className="flex flex-col flex-grow px-4 pb-4 overflow-y-auto no-scrollbar">
        {/* 지난 한주 섹션 */}
        <section>
          <div className="sticky top-0 py-2  flex items-center gap-1 z-20 bg-white">
            <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
              일상 나눔
            </h3>
            <InfoBtn
              text={[
                "기도카드에 <일상 나눔> 항목이 추가되었어요!",
                "기도제목보다 가벼운 일상을 나눠보세요 🙂",
              ]}
              eventOption={{ where: "PrayCardEditPage" }}
              position="start"
            />
          </div>

          <div
            className="bg-gray-100 rounded-lg p-4 mb-4"
            onClick={() => handleEditClick()}
          >
            {isHistoryView ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {prayCard.life}
              </p>
            ) : inputPrayCardLife ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {inputPrayCardLife}
              </p>
            ) : (
              <p className="text-sm text-gray-400 whitespace-pre-wrap">
                ✏️ 최근 겪고 있는 상황을 나눠주세요!
              </p>
            )}
          </div>
        </section>

        {/* 기도제목 섹션 */}
        <section className="flex flex-col flex-grow">
          <div className="sticky top-0 py-2 z-20 bg-white">
            <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
              이번 주 기도제목
            </h3>
          </div>
          <div
            className="bg-gray-100 rounded-lg p-4 flex flex-col flex-grow"
            onClick={() => handleEditClick()}
          >
            {isHistoryView ? (
              <p className="flex-grow text-sm text-gray-700 whitespace-pre-wrap">
                {prayCard.content}
              </p>
            ) : inputPrayCardContent ? (
              <p className="flex-grow text-sm text-gray-700 whitespace-pre-wrap">
                {inputPrayCardContent}
              </p>
            ) : (
              <p className="text-sm text-gray-400 whitespace-pre-wrap">
                ✏️ 공동체에서 함께 기도할 제목을 작성해 주세요!
              </p>
            )}
          </div>
        </section>

        {/* 하단 정보 */}
        {prayCard.updated_at !== prayCard.created_at && (
          <p className="text-xs text-end text-gray-400">(편집됨)</p>
        )}
      </div>
    </div>
  );
};

export default MyPrayCardUI;
