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
  const setUserNotificationView = useBaseStore(
    (state) => state.setUserNotificationView
  );
  const isOpenNotificationPopover = useBaseStore(
    (state) => state.isOpenNotificationPopover
  );
  const setIsOpenNotificationPopover = useBaseStore(
    (state) => state.setIsOpenNotificationPopover
  );

  if (!user || !targetGroup) return null;

  const onClickNotificationBtn = async () => {
    analyticsTrack("클릭_알림_버튼", {});
    if (isOpenNotificationPopover) {
      const newNotificationList = await fetchUserNotificationListByGroupId(
        user.id,
        targetGroup.id,
        true
      );
      setUserNotificationView(newNotificationList);
    }
  };

  return (
    <Popover
      open={isOpenNotificationPopover}
      onOpenChange={setIsOpenNotificationPopover}
    >
      <PopoverTrigger onClick={() => onClickNotificationBtn()}>
        <div className="relative cursor-pointer">
          {userNotificationUnreadTotal > 0 &&
            (userNotificationUnreadTotal < 10 ? (
              <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-destructive rounded-full text-xs text-white">
                {userNotificationUnreadTotal}
              </div>
            ) : (
              <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-destructive rounded-full text-[0.5rem] text-white">
                10+
              </div>
            ))}
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
