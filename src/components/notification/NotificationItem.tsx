import useBaseStore from "@/stores/baseStore";
import { Notification } from "../../../supabase/types/tables";
import { getDateDistance } from "@toss/date";
import { analyticsTrack } from "@/analytics/analytics";
import { getISOToday } from "@/lib/utils";
import { useState } from "react";
import { NotificationType } from "./NotificationType";
import { Badge } from "../ui/badge";

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
  const user = useBaseStore((state) => state.user);
  const targetGroup = useBaseStore((state) => state.targetGroup);
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
    if (!user || !targetGroup) return null;
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

  return (
    <div
      onClick={() => checkNotification(notification)}
      className="w-full flex items-start gap-2 p-2 hover:bg-muted/50 rounded-lg transition-colors"
    >
      <span
        className={`mt-2 rounded-full w-[0.4rem] h-[0.4rem] ${
          unread && "bg-red-500"
        }`}
      ></span>
      <div className="flex-grow space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <p className="font-medium">{notification.title}</p>
            {notification.type == NotificationType.NOTICE && (
              <Badge>공지</Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {dateDistance.days > 0
              ? `${dateDistance.days}일 전`
              : dateDistance.hours > 0
              ? `${dateDistance.hours}시간 전`
              : `${dateDistance.minutes}분 전`}
          </span>
        </div>
        <div>
          {notification.body.split("").map((line, index) => (
            <p key={index} className="text-sm text-muted-foreground">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
