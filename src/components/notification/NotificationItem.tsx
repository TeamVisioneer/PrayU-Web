import useBaseStore from "@/stores/baseStore";
import { Notification } from "../../../supabase/types/tables";
import { getDateDistance } from "@toss/date";
import { analyticsTrack } from "@/analytics/analytics";
import { getISOToday } from "@/lib/utils";
import { useState } from "react";
import { NotificationType } from "./NotificationType";
import { Badge } from "../ui/badge";
import { RiBellLine, RiMegaphoneLine } from "react-icons/ri";

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
}) => {
  const updateNotification = useBaseStore((state) => state.updateNotification);
  const userNotificationUnreadTotal = useBaseStore(
    (state) => state.userNotificationUnreadTotal
  );
  const setUserNotificationUnreadTotal = useBaseStore(
    (state) => state.setUserNotificationUnreadTotal
  );

  const setIsOpenEventDialog = useBaseStore(
    (state) => state.setIsOpenEventDialog
  );
  const dateDistance = getDateDistance(
    new Date(notification.created_at),
    new Date()
  );

  const [unread, setUnread] = useState<boolean>(
    Boolean(!notification.checked_at)
  );

  const checkNotification = async (notification: Notification) => {
    analyticsTrack("클릭_알림_확인", { notification_id: notification.id });
    setUnread(false);
    setUserNotificationUnreadTotal(userNotificationUnreadTotal - 1);
    await updateNotification(notification.id, { checked_at: getISOToday() });
    if (notification.type == NotificationType.NOTICE) {
      setIsOpenEventDialog(true);
    } else {
      window.location.href = "/group/" + notification.group_id;
    }
  };

  const isNotice = notification.type === NotificationType.NOTICE;

  return (
    <div
      onClick={() => checkNotification(notification)}
      className="relative p-4 cursor-pointer group"
    >
      {/* 읽지않음 표시 */}
      {unread && (
        <div className="absolute top-4 left-0 w-1 h-6 bg-gradient-to-b from-mainBtn to-blue-600 rounded-r-full"></div>
      )}

      <div className="flex items-start gap-3 pl-2">
        {/* 아이콘 */}
        <div
          className={`flex-shrink-0 p-2 rounded-lg mt-0.5 ${
            isNotice
              ? "bg-gradient-to-br from-orange-100 to-orange-200"
              : "bg-gradient-to-br from-blue-100 to-blue-200"
          }`}
        >
          {isNotice ? (
            <RiMegaphoneLine size={16} className="text-orange-600" />
          ) : (
            <RiBellLine size={16} className="text-blue-600" />
          )}
        </div>

        {/* 컨텐츠 */}
        <div className="flex-grow min-w-0 space-y-2">
          {/* 헤더 */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <h3
                className={`font-semibold text-gray-800 truncate ${
                  unread ? "text-gray-900" : "text-gray-700"
                }`}
              >
                {notification.title}
              </h3>
              {isNotice && (
                <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                  공지
                </Badge>
              )}
            </div>

            {/* 시간 */}
            <div className="flex-shrink-0 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
              {dateDistance.days > 365
                ? `${Math.floor(dateDistance.days / 365)}년 전`
                : dateDistance.days > 30
                ? `${Math.floor(dateDistance.days / 30)}달 전`
                : dateDistance.days > 0
                ? `${dateDistance.days}일 전`
                : dateDistance.hours > 0
                ? `${dateDistance.hours}시간 전`
                : `${dateDistance.minutes}분 전`}
            </div>
          </div>

          {/* 본문 */}
          <div className="space-y-1">
            {notification.body.split("\n").map((line, index) => (
              <p
                key={index}
                className={`text-sm leading-relaxed ${
                  unread ? "text-gray-600" : "text-gray-500"
                }`}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* 읽지않음 상태일 때 배경 강조 */}
      {!unread && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent rounded-xl pointer-events-none"></div>
      )}
    </div>
  );
};

export default NotificationItem;
