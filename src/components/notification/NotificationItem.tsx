import useBaseStore from "@/stores/baseStore";
import { Notification } from "../../../supabase/types/tables";
import { getDateDistance } from "@toss/date";
import { analyticsTrack } from "@/analytics/analytics";
import { getISOToday } from "@/lib/utils";
import { useState } from "react";

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

  const dateDistance = getDateDistance(
    new Date(notification.created_at),
    new Date()
  );

  const [unread, setUnread] = useState<boolean>(
    Boolean(!notification.checked_at)
  );

  const checkNotification = async (id: string) => {
    if (!user || !targetGroup) return null;
    analyticsTrack("클릭_알림_확인", { notification_id: id });
    setUnread(false);
    setUserNotificationUnreadTotal(userNotificationUnreadTotal - 1);
    await updateNotification(id, { checked_at: getISOToday() });
  };

  return (
    <div
      onClick={() => checkNotification(notification.id)}
      className="flex items-start gap-2 p-2 hover:bg-muted/50 rounded-lg transition-colors"
    >
      <span
        className={`mt-2 rounded-full w-[0.4rem] h-[0.4rem] ${
          unread && "bg-red-500"
        }`}
      ></span>
      <div className="flex-grow space-y-1">
        <div className="flex items-center justify-between">
          <p className="font-medium">{notification.title}</p>
          <span className="text-xs text-muted-foreground">
            {dateDistance.days > 0
              ? `${dateDistance.days}일 전`
              : dateDistance.hours > 0
              ? `${dateDistance.hours}시간 전`
              : `${dateDistance.minutes}분 전`}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{notification.body}</p>
      </div>
    </div>
  );
};

export default NotificationItem;
