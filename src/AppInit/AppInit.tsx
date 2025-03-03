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

    // 키보드가 올라왔는지 여부를 감지하는 간단한 변수
    let isKeyboardVisible = false;

    const setVh = () => {
      // 기존 vh 설정 로직 유지
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);

      // textarea나 input 간 포커스 이동시 추가 리사이즈 방지
      const activeElement = document.activeElement as HTMLElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA")
      ) {
        if (isKeyboardVisible) {
          // 이미 키보드가 올라온 상태면 이벤트 전파 중단
          setTimeout(() => {
            activeElement.scrollIntoView({
              block: "center",
              behavior: "smooth",
            });
          }, 100);
        } else {
          // 키보드가 처음 올라오는 상태
          isKeyboardVisible = true;
        }
      } else {
        // input/textarea에 포커스가 없으면 키보드 내려간 상태로 간주
        isKeyboardVisible = false;
      }
    };

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
