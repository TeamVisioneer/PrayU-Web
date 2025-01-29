import { RiNotification4Line } from "react-icons/ri";
import useBaseStore from "@/stores/baseStore";
import { useNavigate } from "react-router-dom";

const NotificationBtn = () => {
  const userNotificationUnreadTotal = useBaseStore(
    (state) => state.userNotificationUnreadTotal
  );
  const navigate = useNavigate();

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
