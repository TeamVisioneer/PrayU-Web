import { PrayCardWithProfiles } from "supabase/types/tables";
import { UserProfile } from "../profile/UserProfile";
import OtherPrayCardMenuBtn from "./OtherPrayCardMenuBtn";
import { getDateDistance } from "@toss/date";
import { getISOOnlyDate, getISOTodayDate } from "@/lib/utils";
import SkeletonPrayCardUI from "./SkeletonPrayCardUI";
import InfoBtn from "../alert/infoBtn";

interface PrayCardProps {
  prayCard: PrayCardWithProfiles | undefined;
}

const PrayCardUI: React.FC<PrayCardProps> = ({ prayCard }) => {
  if (!prayCard) return <SkeletonPrayCardUI />;

  const getDateText = (days: number) => {
    if (days === 0) return "오늘";
    if (days === 1) return "어제";
    return `${days}일 전`;
  };

  const dateDistance = getDateDistance(
    new Date(getISOOnlyDate(prayCard.created_at)),
    new Date(getISOTodayDate())
  );

  return (
    <div className="flex flex-col flex-grow overflow-y-auto no-scrollbar bg-white rounded-2xl shadow-prayCard">
      {/* 헤더 섹션 */}
      <div className="z-30 h-14 p-4 bg-white flex items-center justify-between border-b transform-gpu">
        <div className="flex items-center gap-2">
          <UserProfile
            profile={prayCard.profiles}
            imgSize="w-7 h-7"
            fontSize="text-sm font-medium"
          />
          <span className="text-xs text-gray-500 font-thin">
            {getDateText(dateDistance.days)}
          </span>
        </div>
        <OtherPrayCardMenuBtn
          targetUserId={prayCard.user_id || ""}
          prayContent={prayCard.content || ""}
        />
      </div>

      {/* 컨텐츠 섹션 */}
      <div className="flex flex-col px-4 pb-4 overflow-y-auto no-scrollbar">
        {/* 지난 한주 섹션 */}
        <section>
          <div className="sticky top-0 py-4 flex items-center gap-1 z-20 bg-white">
            <h3 className="text-sm font-medium text-gray-600 flex items-center gap-2">
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

          <div className="bg-gray-50 rounded-lg p-4 mb-2">
            {prayCard.life ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {prayCard.life}
              </p>
            ) : (
              <p className="text-sm text-gray-400 whitespace-pre-wrap">
                아직 작성된 내용이 없습니다.
              </p>
            )}
          </div>
        </section>

        {/* 기도제목 섹션 */}
        <section>
          <div className="sticky top-0 py-4 z-20 bg-white">
            <h3 className="text-sm font-medium text-gray-600 flex items-center gap-2">
              이번 주 기도제목
            </h3>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            {prayCard.content ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {prayCard.content}
              </p>
            ) : (
              <p className="text-sm text-gray-400 whitespace-pre-wrap">
                아직 작성된 내용이 없습니다.
              </p>
            )}
          </div>
        </section>

        {/* 하단 정보 */}
        {prayCard.updated_at == prayCard.created_at && (
          <p className="text-xs text-end text-gray-400">(편집됨)</p>
        )}
      </div>
    </div>
  );
};

export default PrayCardUI;
