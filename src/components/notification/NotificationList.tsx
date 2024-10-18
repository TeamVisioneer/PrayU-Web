import { RiNotification4Line } from "react-icons/ri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import NotificationItem from "./NotificationItem";
import useBaseStore from "@/stores/baseStore";
import { analyticsTrack } from "@/analytics/analytics";
import ClipLoader from "react-spinners/ClipLoader";

const NotificationList = () => {
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const user = useBaseStore((state) => state.user);
  const userNotificationList = useBaseStore(
    (state) => state.userNotificationList
  );
  const setUserNotificationList = useBaseStore(
    (state) => state.setUserNotificationList
  );
  const userNotificationUnreadTotal = useBaseStore(
    (state) => state.userNotificationUnreadTotal
  );
  const fetchUserNotificationListByGroupId = useBaseStore(
    (state) => state.fetchUserNotificationListByGroupId
  );

  if (!user || !targetGroup) return null;

  const onClickUnreadNotification = async () => {
    analyticsTrack("클릭_알림_읽지않음", {});
    setUserNotificationList(null);
    await fetchUserNotificationListByGroupId(user.id, targetGroup.id, true);
  };

  const onClickAllNotification = async () => {
    analyticsTrack("클릭_알림_전체", {});
    setUserNotificationList(null);
    await fetchUserNotificationListByGroupId(user.id, targetGroup.id, false);
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
            <Badge variant="destructive">{userNotificationUnreadTotal}</Badge>
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
          {!userNotificationList ? (
            <div className="flex justify-center items-center h-[300px] w-full">
              <ClipLoader color="#EFF4F8" size={10} />
            </div>
          ) : (
            <>
              <TabsContent value="unread">
                <ScrollArea className="h-[300px]">
                  {userNotificationUnreadTotal === 0 ? (
                    <div className="flex justify-center items-center h-[300px] w-full text-gray-500 text-sm">
                      모든 알림을 확인하였어요!
                    </div>
                  ) : (
                    userNotificationList.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                      />
                    ))
                  )}
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
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NotificationList;
