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

    // dvh 미지원 구형 브라우저 전용 폴백 — 지원 브라우저는 App.css의 --vh: 1dvh 사용
    const needsVhFallback = !CSS.supports("height", "1dvh");
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    if (needsVhFallback) {
      setVh();
      window.addEventListener("resize", setVh);
    }
    window.addEventListener("message", handlePushNotification);

    return () => {
      if (needsVhFallback) {
        window.removeEventListener("resize", setVh);
      }
      window.removeEventListener("message", handlePushNotification);
    };
  }, [setIsApp, setIsIOS, setIsAndroid]);

  return null;
};

export default AppInit;
