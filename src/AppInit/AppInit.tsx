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

    // resize 이벤트는 방향 전환(orientation change)에만 대응
    const handleResize = () => {
      // 방향 전환 시에만 vh 업데이트
      if (window.innerWidth !== window.outerWidth) {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
      }
    };

    // 최초 한 번만 vh 값을 설정
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);

    window.addEventListener("resize", handleResize);
    window.addEventListener("message", handlePushNotification);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("message", handlePushNotification);
    };
  }, [setIsApp, setIsIOS, setIsAndroid]);

  return null;
};

export default AppInit;
