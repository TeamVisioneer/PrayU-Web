import useBaseStore from "@/stores/baseStore";
import { Notification } from "../../../supabase/types/tables";
import { getDateDistance } from "@toss/date";
import { analyticsTrack } from "@/analytics/analytics";
import { getISOToday } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
}) => {
  const updateNotification = useBaseStore((state) => state.updateNotification);
  const fetchUserNotificationListByGroupId = useBaseStore(
    (state) => state.fetchUserNotificationListByGroupId
  );
  const user = useBaseStore((state) => state.user);
  const targetGroup = useBaseStore((state) => state.targetGroup);

  const dateDistance = getDateDistance(
    new Date(notification.created_at),
    new Date()
  );

  const checkNotification = async (id: string) => {
    if (!user || !targetGroup) return null;
    analyticsTrack("클릭_알림_확인", { notification_id: id });
    await updateNotification(id, { checked_at: getISOToday() });
    await fetchUserNotificationListByGroupId(user.id, targetGroup.id, true);
  };

  return (
    <div
      onClick={() => checkNotification(notification.id)}
      className="flex items-start space-x-4 p-2 hover:bg-muted/50 rounded-lg transition-colors"
    >
      <div className="flex-1 space-y-1">
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
