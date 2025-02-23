import useBaseStore from "@/stores/baseStore";
import React, { useEffect } from "react";

const AppInit: React.FC = () => {
  const setIsApp = useBaseStore((state) => state.setIsApp);
  const setIsIOS = useBaseStore((state) => state.setIsIOS);
  const setIsAndroid = useBaseStore((state) => state.setIsAndroid);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isApp = userAgent.includes("prayu");
    const isIOS = userAgent.includes("prayu-ios");
    const isAndroid = userAgent.includes("prayu-android");

    setIsApp(isApp);
    setIsIOS(isIOS);
    setIsAndroid(isAndroid);

    const handlePushNotification = (event: MessageEvent) => {
      try {
        const { type, url } = event.data;
        if (type === "PUSH_NOTIFICATION_NAVIGATION") {
          window.location.href = url;
        }
      } catch (error) {
        console.error("Push notification handling error:", error);
      }
    };

    // 초기 실제 viewport 높이를 저장
    const initialViewportHeight = window.innerHeight;

    const setVh = () => {
      // 현재 높이가 초기 높이보다 작다면 키보드가 올라와 있는 상태로 판단
      const isKeyboardVisible = window.innerHeight < initialViewportHeight;

      // 키보드가 올라와 있지 않은 상태일 때만 vh 업데이트
      if (!isKeyboardVisible) {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
      }
    };

    // 앱 시작시 한번 실행
    setVh();

    window.addEventListener("resize", setVh);
    window.addEventListener("message", handlePushNotification);

    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("message", handlePushNotification);
    };
  }, [setIsApp, setIsIOS, setIsAndroid]);

  return null;
};

export default AppInit;
