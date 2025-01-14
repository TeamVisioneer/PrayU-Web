import { RiNotification4Line } from "react-icons/ri";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import NotificationItem from "./NotificationItem";
import useBaseStore from "@/stores/baseStore";
import { analyticsTrack } from "@/analytics/analytics";
import { useEffect, useState } from "react";
import { IoChevronBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import ShowMoreBtn from "../common/ShowMoreBtn";

const NotificationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userNotificationList = useBaseStore(
    (state) => state.userNotificationList
  );
  const userNotificationUnreadTotal = useBaseStore(
    (state) => state.userNotificationUnreadTotal
  );
  const userNotificationTotal = useBaseStore(
    (state) => state.userNotificationTotal
  );
  const fetchUserNotificationList = useBaseStore(
    (state) => state.fetchUserNotificationList
  );
  const fetchNotificationCount = useBaseStore(
    (state) => state.fetchNotificationCount
  );
  const checkAllNotification = useBaseStore(
    (state) => state.checkAllNotification
  );
  const userNotificationView = useBaseStore(
    (state) => state.userNotificationView
  );
  const setUserNotificationView = useBaseStore(
    (state) => state.setUserNotificationView
  );
  const [offset, setOffset] = useState(20);

  useEffect(() => {
    const fetchNotification = async () => {
      if (!user) return;
      await fetchNotificationCount(user.id, true);
      const newNotificationList = await fetchUserNotificationList(user.id);
      setUserNotificationView(newNotificationList);
    };
    fetchNotification();
  }, [
    user,
    fetchNotificationCount,
    fetchUserNotificationList,
    setUserNotificationView,
  ]);

  if (!user) return null;

  const onClickCheckAllNotification = async () => {
    analyticsTrack("클릭_알림_모두읽음", {});
    await checkAllNotification(user.id);
    await fetchNotificationCount(user.id, true);
    setUserNotificationView([]);
    setOffset(20);
    const newNotificationList = await fetchUserNotificationList(user.id);
    setUserNotificationView(newNotificationList);
  };

  const onClickNotificationTab = async (unreadOnly: boolean) => {
    const trackEvent = unreadOnly ? "클릭_알림_읽지않음" : "클릭_알림_전체";
    analyticsTrack(trackEvent, {});
    setUserNotificationView([]);
    setOffset(20);
    const newNotificationList = await fetchUserNotificationList(
      user.id,
      unreadOnly
    );
    setUserNotificationView(newNotificationList);
    await fetchNotificationCount(user.id, unreadOnly);
  };

  const onClickMoreNotification = async (unreadOnly: boolean) => {
    const totalCount = unreadOnly
      ? userNotificationUnreadTotal
      : userNotificationTotal;
    if (offset >= totalCount) return null;

    const limit = offset > totalCount ? totalCount - offset : 20;
    const newNotificationList = await fetchUserNotificationList(
      user.id,
      unreadOnly,
      limit,
      offset
    );
    setUserNotificationView([...userNotificationView, ...newNotificationList]);
    setOffset(offset + 10);
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      {/* 상단 헤더 영역 */}
      <div className="w-full">
        <div className="max-w-5xl mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <IoChevronBack size={20} onClick={() => navigate(-1)} />
              <h1 className="text-xl font-bold">알림</h1>
            </div>
            {userNotificationUnreadTotal > 0 && (
              <div className="flex items-center gap-2">
                <Badge
                  className="cursor-pointer hover:bg-secondary/80 transition-colors"
                  variant="secondary"
                  onClick={() => onClickCheckAllNotification()}
                >
                  모두 읽음
                </Badge>
                <Badge variant="destructive" className="px-3">
                  {userNotificationUnreadTotal}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col items-center">
        <Tabs defaultValue="unread" className="w-11/12">
          <TabsList className="w-full flex h-12 p-1">
            <TabsTrigger
              value="unread"
              onClick={() => onClickNotificationTab(true)}
              className="flex-1 h-full text-gray-400 data-[state=active]:text-gray-900 data-[state=active]:font-semibold transition-colors"
            >
              읽지 않음
            </TabsTrigger>
            <TabsTrigger
              value="all"
              onClick={() => onClickNotificationTab(false)}
              className="flex-1 h-full text-gray-400 data-[state=active]:text-gray-900 data-[state=active]:font-semibold transition-colors"
            >
              전체
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unread" className="pb-5 w-full">
            {userNotificationUnreadTotal === 0 ? (
              <div className="flex flex-col justify-center items-center h-full py-12 text-gray-500">
                <RiNotification4Line size={48} className="mb-4 text-gray-300" />
                <p>모든 알림을 확인하였어요!</p>
              </div>
            ) : (
              <div className="space-y-2 flex flex-col items-center">
                {userNotificationView.map((notification, index) => (
                  <NotificationItem key={index} notification={notification} />
                ))}
                {offset < userNotificationUnreadTotal && (
                  <ShowMoreBtn
                    isLoading={!userNotificationList}
                    onClick={() => onClickMoreNotification(true)}
                  />
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="pb-5 w-full">
            <div className="space-y-2 flex flex-col items-center">
              {userNotificationView.map((notification, index) => (
                <NotificationItem key={index} notification={notification} />
              ))}
              {offset < userNotificationTotal && (
                <ShowMoreBtn
                  isLoading={!userNotificationList}
                  onClick={() => onClickMoreNotification(false)}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationPage;
