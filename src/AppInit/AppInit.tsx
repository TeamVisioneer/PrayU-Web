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

    const handleResize = () => {
      // 현재 포커스된 요소가 input이나 textarea면 vh 업데이트 하지 않음
      const activeElement = document.activeElement?.tagName.toLowerCase();
      if (activeElement === "input" || activeElement === "textarea") {
        return;
      }

      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    handleResize();

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
