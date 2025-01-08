import { RiNotification4Line } from "react-icons/ri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import NotificationItem from "./NotificationItem";
import useBaseStore from "@/stores/baseStore";
import { analyticsTrack } from "@/analytics/analytics";
import { useState } from "react";

const NotificationList = () => {
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const user = useBaseStore((state) => state.user);

  const userNotificationUnreadTotal = useBaseStore(
    (state) => state.userNotificationUnreadTotal
  );
  const userNotificationTotal = useBaseStore(
    (state) => state.userNotificationTotal
  );
  const fetchUserNotificationListByGroupId = useBaseStore(
    (state) => state.fetchUserNotificationListByGroupId
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
  const [offset, setOffset] = useState(10);

  if (!user || !targetGroup) return null;

  const onClickCheckAllNotification = async () => {
    analyticsTrack("클릭_알림_모두읽음", {});
    await checkAllNotification(user.id, targetGroup.id);
    await fetchNotificationCount(user.id, targetGroup.id, true);
    await fetchUserNotificationListByGroupId(user.id, targetGroup.id, true);
    await fetchUserNotificationListByGroupId(user.id, targetGroup.id);
  };

  const onClickNotificationTab = async (unreadOnly: boolean) => {
    const trackEvent = unreadOnly ? "클릭_알림_읽지않음" : "클릭_알림_전체";
    analyticsTrack(trackEvent, {});
    setUserNotificationView([]);
    setOffset(10);
    const newNotificationList = await fetchUserNotificationListByGroupId(
      user.id,
      targetGroup.id,
      unreadOnly
    );
    setUserNotificationView(newNotificationList);
    await fetchNotificationCount(user.id, targetGroup.id, unreadOnly);
  };

  const onClickMoreNotification = async (unreadOnly: boolean) => {
    const totalCount = unreadOnly
      ? userNotificationUnreadTotal
      : userNotificationTotal;
    if (offset >= totalCount) return null;

    const limit = offset > totalCount ? totalCount - offset : 10;
    const newNotificationList = await fetchUserNotificationListByGroupId(
      user.id,
      targetGroup.id,
      unreadOnly,
      limit,
      offset
    );
    setUserNotificationView([...userNotificationView, ...newNotificationList]);
    setOffset(offset + 10);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiNotification4Line size={22} />
            그룹 알림
          </div>
          {userNotificationUnreadTotal > 0 && (
            <div className="flex item-center gap-2">
              <Badge
                className="cursor-pointer"
                variant="secondary"
                onClick={() => onClickCheckAllNotification()}
              >
                모두 읽음
              </Badge>
              <Badge variant="destructive">{userNotificationUnreadTotal}</Badge>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="unread">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="unread"
              onClick={() => onClickNotificationTab(true)}
            >
              읽지 않음
            </TabsTrigger>
            <TabsTrigger
              value="all"
              onClick={() => onClickNotificationTab(false)}
            >
              전체
            </TabsTrigger>
          </TabsList>
          <TabsContent value="unread">
            <ScrollArea>
              {userNotificationUnreadTotal === 0 ? (
                <div className="flex justify-center items-center h-[300px] w-full text-gray-500 text-sm">
                  모든 알림을 확인하였어요!
                </div>
              ) : (
                <div className="h-[300px] overflow-auto scroll-smooth">
                  {userNotificationView.map((notification, index) => (
                    <NotificationItem key={index} notification={notification} />
                  ))}
                  {offset < userNotificationUnreadTotal && (
                    <div
                      onClick={() => onClickMoreNotification(true)}
                      className="w-full text-center text-gray-500 text-sm underline "
                    >
                      더보기
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="all">
            <ScrollArea className="h-[300px]">
              <div className="h-[300px] overflow-auto scroll-smooth">
                {userNotificationView.map((notification, index) => (
                  <NotificationItem key={index} notification={notification} />
                ))}
                {offset < userNotificationTotal && (
                  <div
                    onClick={() => onClickMoreNotification(false)}
                    className="w-full text-center text-gray-500 text-sm underline "
                  >
                    더보기
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NotificationList;
