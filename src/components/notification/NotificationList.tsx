import { RiNotification4Line } from "react-icons/ri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import NotificationItem from "./NotificationItem";

const NotificationList = () => {
  const notifications = [
    {
      id: "1",
      title: "새 팔로워",
      description: "김철수님이 회원님을 팔로우하기 시작했습니다.",
      date: "방금 전",
      read: false,
    },
    {
      id: "2",
      title: "새 댓글",
      description: "회원님의 게시물에 새로운 댓글이 달렸습니다.",
      date: "10분 전",
      read: false,
    },
    {
      id: "3",
      title: "시스템 알림",
      description:
        "서비스 점검이 예정되어 있습니다. 자세한 내용을 확인해주세요.",
      date: "1시간 전",
      read: false,
    },
    {
      id: "4",
      title: "이벤트 안내",
      description: "신규 이벤트가 시작되었습니다. 지금 확인해보세요!",
      date: "어제",
      read: true,
    },
    {
      id: "5",
      title: "보안 알림",
      description: "새로운 기기에서 로그인이 감지되었습니다.",
      date: "2일 전",
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiNotification4Line size={22} />
            그룹 알림
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="unread">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unread">읽지 않음</TabsTrigger>
            <TabsTrigger value="all">전체</TabsTrigger>
          </TabsList>
          <TabsContent value="unread">
            <ScrollArea>
              {notifications
                .filter((n) => !n.read)
                .map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="all">
            <ScrollArea className="h-[300px]">
              {notifications.map((notification) => (
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
