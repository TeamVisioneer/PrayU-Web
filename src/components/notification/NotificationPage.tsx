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
      const newNotificationList = await fetchUserNotificationList(
        user.id,
        true
      );
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
    <div className="w-full min-h-screen bg-mainBg flex flex-col">
      {/* 상단 헤더 영역 - PrayU 스타일로 개선 */}
      <header className="sticky top-0 z-50 bg-mainBg border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="p-1 hover:bg-white/50 rounded-lg transition-colors"
              >
                <IoChevronBack size={20} className="text-gray-700" />
              </button>
              <h1 className="text-xl font-bold text-gray-800">알림</h1>
              {/* <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-mainBtn to-blue-600 rounded-lg shadow-md">
                  <RiNotification4Line size={16} className="text-white" />
                </div>
              </div> */}
            </div>

            <div className="flex items-center gap-2">
              {userNotificationUnreadTotal > 0 && (
                <>
                  <Badge
                    className="cursor-pointer hover:bg-mainBtn hover:text-white transition-all duration-200 bg-white text-gray-700 border border-gray-200 px-3 py-1 rounded-full font-medium"
                    onClick={() => onClickCheckAllNotification()}
                  >
                    모두 읽음
                  </Badge>
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[24px] text-center">
                    {userNotificationUnreadTotal > 99
                      ? "99+"
                      : userNotificationUnreadTotal}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col items-center pt-6">
        <div className="w-full max-w-5xl px-4">
          <Tabs defaultValue="unread" className="w-full">
            {/* 개선된 탭 리스트 */}
            <TabsList className="w-full bg-white shadow-sm border border-gray-100 rounded-xl p-1 mb-6 h-12">
              <TabsTrigger
                value="unread"
                onClick={() => onClickNotificationTab(true)}
                className="flex-1 h-full text-gray-500 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-mainBtn data-[state=active]:to-blue-600 data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all duration-200 rounded-lg"
              >
                읽지 않음
              </TabsTrigger>
              <TabsTrigger
                value="all"
                onClick={() => onClickNotificationTab(false)}
                className="flex-1 h-full text-gray-500 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-mainBtn data-[state=active]:to-blue-600 data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all duration-200 rounded-lg"
              >
                전체
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unread" className="pb-5 w-full">
              {userNotificationUnreadTotal === 0 ? (
                <div className="flex flex-col justify-center items-center py-16">
                  <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
                    <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <RiNotification4Line
                        size={32}
                        className="text-green-600"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      모든 알림을 확인했어요! 🎉
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      새로운 알림이 오면
                      <br />
                      여기에서 확인할 수 있어요
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 flex flex-col items-center">
                  {userNotificationView.map((notification, index) => (
                    <div
                      key={index}
                      className="w-full bg-white rounded-xl border border-gray-50 overflow-hidden  duration-200"
                    >
                      <NotificationItem notification={notification} />
                    </div>
                  ))}
                  {offset < userNotificationUnreadTotal && (
                    <div className="pt-4">
                      <ShowMoreBtn
                        isLoading={!userNotificationList}
                        onClick={() => onClickMoreNotification(true)}
                      />
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="pb-5 w-full">
              <div className="space-y-3 flex flex-col items-center">
                {userNotificationView.map((notification, index) => (
                  <div
                    key={index}
                    className="w-full bg-white rounded-xl border border-gray-50 overflow-hidden  duration-200"
                  >
                    <NotificationItem notification={notification} />
                  </div>
                ))}
                {offset < userNotificationTotal && (
                  <div className="pt-4">
                    <ShowMoreBtn
                      isLoading={!userNotificationList}
                      onClick={() => onClickMoreNotification(false)}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
