import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RiNotification4Line } from "react-icons/ri";
import NotificationList from "./NotificationList";
import useBaseStore from "@/stores/baseStore";
import { analyticsTrack } from "@/analytics/analytics";

const NotificationBtn = () => {
  const user = useBaseStore((state) => state.user);
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const fetchUserNotificationListByGroupId = useBaseStore(
    (state) => state.fetchUserNotificationListByGroupId
  );
  const userNotificationUnreadTotal = useBaseStore(
    (state) => state.userNotificationUnreadTotal
  );
  const setUserNotificationList = useBaseStore(
    (state) => state.setUserNotificationList
  );

  if (!user || !targetGroup) return null;

  const onClickNotificationBtn = async (open: boolean) => {
    analyticsTrack("클릭_알림_버튼", {});
    if (open) {
      setUserNotificationList(null);
      await fetchUserNotificationListByGroupId(user.id, targetGroup.id, true);
    }
  };

  return (
    <Popover onOpenChange={onClickNotificationBtn}>
      <PopoverTrigger>
        <div className="relative cursor-pointer">
          {userNotificationUnreadTotal > 0 && (
            <div className="absolute top-0 right-0 w-[0.6rem] h-[0.6rem] bg-destructive rounded-full text-center"></div>
          )}
          <RiNotification4Line size={22} />
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <NotificationList />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBtn;
