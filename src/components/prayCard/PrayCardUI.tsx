import { PrayCardWithProfiles } from "supabase/types/tables";
import { UserProfile } from "../profile/UserProfile";
import OtherPrayCardMenuBtn from "./OtherPrayCardMenuBtn";
import { getDateDistance } from "@toss/date";
import { getISOOnlyDate, getISOTodayDate } from "@/lib/utils";

interface PrayCardProps {
  prayCard: PrayCardWithProfiles;
}

const PrayCardUI: React.FC<PrayCardProps> = ({ prayCard }) => {
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
      <div className="sticky top-0 p-4 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserProfile
            profile={prayCard.profiles}
            imgSize="w-7 h-7"
            fontSize="text- font-medium"
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
              {prayCard.content}
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
              {prayCard.content}
            </p>
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

export default PrayCardUI;
