import useBaseStore from "@/stores/baseStore";
import { Notification } from "../../../supabase/types/tables";
import { getDateDistance } from "@toss/date";
import { analyticsTrack } from "@/analytics/analytics";
import { getISOToday } from "@/lib/utils";
import { useState } from "react";
import { NotificationType } from "./NotificationType";
import { Badge } from "../ui/badge";
import { RiBellLine, RiCheckLine, RiMegaphoneLine } from "react-icons/ri";

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
}) => {
  const updateNotification = useBaseStore((state) => state.updateNotification);
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

  const markAsRead = async () => {
    if (!unread) return;

    setUnread(false);
    const currentUnreadCount =
      useBaseStore.getState().userNotificationUnreadTotal;
    if (currentUnreadCount > 0) {
      setUserNotificationUnreadTotal(currentUnreadCount - 1);
    }
    await updateNotification(notification.id, { checked_at: getISOToday() });
  };

  const handleClickMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    analyticsTrack("클릭_알림_읽음처리_버튼", {
      notification_id: notification.id,
    });
    await markAsRead();
  };

  const checkNotification = async (notification: Notification) => {
    analyticsTrack("클릭_알림_확인", { notification_id: notification.id });
    await markAsRead();

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
        <div className="absolute top-6 left-3 w-2 h-2 bg-blue-500 rounded-full"></div>
      )}

      <div className="flex items-start gap-3 pl-4">
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
          <div className="flex flex-col items-start justify-between gap-2">
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

            <div className="flex-grow space-y-1">
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
        {/* 시간 및 읽음 처리 버튼 */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center flex-shrink-0 gap-3">
            {/* 시간 */}
            <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
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

          {/* 읽음 처리 버튼 */}
          {unread && (
            <button
              onClick={handleClickMarkAsRead}
              className="flex-shrink-0 flex items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-violet-600 shadow-sm transition-colors hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:ring-offset-2"
            >
              <RiCheckLine className="h-4 w-4" />
              <span>읽음</span>
            </button>
          )}
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
