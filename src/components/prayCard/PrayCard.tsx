import useBaseStore from "@/stores/baseStore";
import React from "react";
import { PrayCardWithProfiles } from "supabase/types/tables";
import MyPrayCardMenuBtn from "./MyPrayCardMenuBtn";
import OtherPrayCardMenuBtn from "./OtherPrayCardMenuBtn";
import { useNavigate } from "react-router-dom";
import { getDateDistance } from "@toss/date";
import { getISOOnlyDate, getISOTodayDate } from "@/lib/utils";
interface PrayCardProps {
  prayCard: PrayCardWithProfiles | undefined;
  isMoreBtn?: boolean;
  editable?: boolean;
}

// Helper function to format date to "X days ago" in Korean
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "오늘";
  } else if (diffInDays === 1) {
    return "어제";
  } else {
    return `${diffInDays}일 전`;
  }
};

const dateDistanceText = (dateString: string) => {
  const dateDistance = getDateDistance(
    new Date(getISOOnlyDate(dateString)),
    new Date(getISOTodayDate())
  );
  if (dateDistance.days < 1) return "오늘";
  else if (dateDistance.days < 7) return `${dateDistance.days}일 전`;
  else if (dateDistance.days < 30)
    return `${Math.floor(dateDistance.days / 7)}주 전`;
  else if (dateDistance.days < 365)
    return `${Math.floor(dateDistance.days / 30)}달 전`;
  else return "오래 전";
};

export const PrayCard: React.FC<PrayCardProps> = ({
  prayCard,
  isMoreBtn = true,
  editable = false,
}) => {
  const user = useBaseStore((state) => state.user);
  const setIsOpenMyMemberDrawer = useBaseStore(
    (state) => state.setIsOpenMyMemberDrawer
  );
  const navigate = useNavigate();
  const isMyPrayCard = prayCard?.user_id == user?.id;

  const handleClickPrayCard = () => {
    if (isMyPrayCard && editable) {
      setIsOpenMyMemberDrawer(false);
      navigate(`/group/${prayCard?.group_id}/prayCard/${prayCard?.id}/edit`, {
        replace: true,
      });
    }
  };

  if (!prayCard) {
    return (
      <div className="w-full aspect-[3/4] bg-white shadow-prayCard hover:shadow-md transition-shadow rounded-xl overflow-hidden border border-gray-100 flex flex-col">
        {/* Header skeleton */}
        <div className="p-4 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="p-4 space-y-4 overflow-y-auto flex-grow">
          {/* Daily sharing skeleton */}
          <div>
            <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="flex items-start gap-2">
              <div className="min-w-5 self-stretch flex justify-center">
                <div className="w-0.5 h-full bg-gray-200 flex-shrink-0"></div>
              </div>
              <div className="space-y-2 w-full">
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Prayer requests skeleton */}
          <div>
            <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <ul className="space-y-3">
              {[1, 2, 3].map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="min-w-5 h-5 bg-gray-200 rounded-full flex-shrink-0 animate-pulse"></div>
                  <div className="space-y-2 w-full">
                    <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Parse prayer content by newlines
  const prayRequests = prayCard.content
    ?.split("\n\n")
    .filter((item) => item.trim() !== "") // Filter out empty lines
    .map((content, index) => ({
      id: `pray-${index}`,
      content: content.trim(),
    }));

  const timeAgo = dateDistanceText(prayCard.created_at);
  const userInitial = prayCard.profiles.full_name
    ? prayCard.profiles.full_name.charAt(0).toUpperCase()
    : "";

  return (
    // Fixed aspect ratio container (3:4 aspect ratio)
    <div className="w-full aspect-[3/4] bg-white shadow-prayCard rounded-xl overflow-hidden border border-gray-100 flex flex-col">
      {/* Header - user info - fixed */}
      <div className="p-4 pb-3 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-full overflow-hidden">
            {prayCard.profiles.avatar_url ? (
              <img
                src={prayCard.profiles.avatar_url}
                alt={prayCard.profiles.full_name || ""}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-600">
                {userInitial}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {isMyPrayCard ? "나" : prayCard.profiles.full_name}
            </h3>
            <p className="text-xs text-gray-500">{timeAgo}</p>
          </div>
        </div>
        {isMoreBtn &&
          (isMyPrayCard ? (
            <MyPrayCardMenuBtn
              handleEditClick={editable ? handleClickPrayCard : undefined}
              prayCard={prayCard}
            />
          ) : (
            <OtherPrayCardMenuBtn
              targetUserId={prayCard.user_id || ""}
              prayContent={prayCard.content || ""}
            />
          ))}
      </div>

      {/* Scrollable content area */}
      <div
        onClick={() => editable && handleClickPrayCard()}
        className="p-4 space-y-4 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">일상 나눔</h4>
          <div className="flex items-start gap-2">
            <div className="min-w-5 self-stretch flex justify-center">
              <div className="w-0.5 self-stretch bg-blue-100 flex-shrink-0"></div>
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {prayCard.life}
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">기도제목</h4>
          <ul className="space-y-2">
            {prayRequests?.map((request) => (
              <li key={request.id} className="flex items-start gap-2">
                <div className="min-w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-700">{request.content}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer - actions - fixed */}
      {/* <div className="pt-2 pb-4 px-4 flex justify-end flex-shrink-0 border-t border-gray-100">
        <div className="flex space-x-2">
          <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>함께 기도</span>
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default PrayCard;
