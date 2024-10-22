import React, { useEffect } from "react";

const MetaPixelInit: React.FC = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/src/analytics/metaPixelScript.js";
    script.type = "module";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.fbq) {
        console.log("hoizza");
        window.fbq("init", `${import.meta.env.VITE_META_PIXEL_ID}`);
        window.fbq("track", "PageView");
      } else {
        console.error("Meta Pixel을 초기화할 수 없습니다.");
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
};
export default MetaPixelInit;
