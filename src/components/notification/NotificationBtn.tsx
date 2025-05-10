import { RiNotification4Line } from "react-icons/ri";
import useBaseStore from "@/stores/baseStore";
import { useNavigate } from "react-router-dom";
import useRealtimeNotification from "./useRealtimeNotification";
import { useEffect } from "react";

const NotificationBtn = () => {
  const navigate = useNavigate();
  const userNotificationUnreadTotal = useBaseStore(
    (state) => state.userNotificationUnreadTotal
  );
  const setNotificationUnreadTotal = useBaseStore(
    (state) => state.setUserNotificationUnreadTotal
  );
  const user = useBaseStore((state) => state.user);

  useRealtimeNotification(user!.id, () => {
    setNotificationUnreadTotal(userNotificationUnreadTotal + 1);
  });

  const fetchNotificationCount = useBaseStore(
    (state) => state.fetchNotificationCount
  );

  useEffect(() => {
    if (user) fetchNotificationCount(user.id, true);
  }, [user, fetchNotificationCount]);

  return (
    <button
      onClick={() => navigate("/notifications")}
      className="relative hover:bg-gray-100 rounded-full"
    >
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
    </button>
  );
};

export default NotificationBtn;
