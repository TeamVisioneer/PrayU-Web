import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertCircle, Bell } from "lucide-react";
import useBaseStore from "@/stores/baseStore";
import { NotificationType } from "@/components/notification/NotificationType";

const NotificationSendDialog = () => {
  const [startId, setStartId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [sendResult, setSendResult] = useState("알림 생성 전");

  const fetchProfileListByStartId = useBaseStore(
    (state) => state.fetchProfileListByStartId
  );
  const createNotification = useBaseStore((state) => state.createNotification);

  const handleSubmit = async () => {
    setSendResult("알림 생성중");
    const limit = 1000;
    let isSending = true;

    while (isSending) {
      const userIds = await fetchProfileListByStartId(startId, limit);
      if (!userIds) {
        isSending = false;
        setSendResult(`[알림 생성 실패] startId : ${startId}`);
        break;
      }
      const notification = await createNotification({
        userId: userIds,
        title: title,
        body: content,
        type: NotificationType.NOTICE,
      });
      if (!notification) {
        isSending = false;
        setSendResult(`[알림 생성 실패] startId : ${startId}`);
        break;
      }
      if (userIds.length < limit) {
        isSending = false;
        setSendResult(`알림 생성 완료`);
        break;
      } else setStartId(userIds[limit - 1]);
    }

    setSendResult("알림 생성 완료");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          공지사항 알림 작성
        </Button>
      </DialogTrigger>
      <DialogContent className="w-11/12 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">공지사항 알림 작성</DialogTitle>
        </DialogHeader>
        <section className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              제목
            </label>
            <Input
              id="title"
              placeholder="알림 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              내용
            </label>
            <Textarea
              id="content"
              placeholder="알림 내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="startId" className="text-sm font-medium">
              startId
            </label>
            <Input
              id="startId"
              value={startId}
              onChange={(e) => setStartId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              전송 결과
            </label>
            <Input value={sendResult} disabled={true} />
          </div>
          <Button
            onClick={() => handleSubmit()}
            disabled={
              sendResult == "알림 생성 전" && title && content ? false : true
            }
            className="w-full"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            공지 알림 생성
          </Button>
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationSendDialog;
