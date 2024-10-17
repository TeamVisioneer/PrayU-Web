interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    description: string;
    date: string;
    read: boolean;
  };
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
}) => {
  return (
    <div className="flex items-start space-x-4 p-2 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="font-medium">{notification.title}</p>
          <span className="text-xs text-muted-foreground">
            {notification.date}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {notification.description}
        </p>
      </div>
    </div>
  );
};

export default NotificationItem;
