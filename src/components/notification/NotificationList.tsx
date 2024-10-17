import { RiNotification4Line } from "react-icons/ri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import NotificationItem from "./NotificationItem";
import useBaseStore from "@/stores/baseStore";
import ClipLoader from "react-spinners/ClipLoader";
import { analyticsTrack } from "@/analytics/analytics";

const NotificationList = () => {
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const user = useBaseStore((state) => state.user);
  const userNotificationList = useBaseStore(
    (state) => state.userNotificationList
  );
  const userNotificationUnread = useBaseStore(
    (state) => state.userNotificationUnread
  );
  const fetchUserNotificationListByGroupId = useBaseStore(
    (state) => state.fetchUserNotificationListByGroupId
  );

  if (!user || !targetGroup) return null;
  if (!userNotificationList) {
    return (
      <div className="flex justify-center items-center h-[300px] w-full">
        <ClipLoader color="#70AAFF" size={20} />
      </div>
    );
  }

  const onClickUnreadNotification = async () => {
    analyticsTrack("클릭_알림_읽지않음", {});
    await fetchUserNotificationListByGroupId(user.id, targetGroup.id, true);
  };

  const onClickAllNotification = async () => {
    analyticsTrack("클릭_알림_전체", {});
    await fetchUserNotificationListByGroupId(user.id, targetGroup.id, false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiNotification4Line size={22} />
            그룹 알림
          </div>
          {userNotificationUnread > 0 && (
            <Badge variant="destructive">{userNotificationUnread}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="unread">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="unread"
              onClick={() => onClickUnreadNotification()}
            >
              읽지 않음
            </TabsTrigger>
            <TabsTrigger value="all" onClick={() => onClickAllNotification()}>
              전체
            </TabsTrigger>
          </TabsList>
          <TabsContent value="unread">
            <ScrollArea className="h-[300px]">
              {userNotificationList.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="all">
            <ScrollArea className="h-[300px]">
              {userNotificationList.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NotificationList;
