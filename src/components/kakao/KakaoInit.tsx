import React, { useEffect } from "react";

const KakaoInit: React.FC = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
    script.integrity =
      "sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4";
    script.crossOrigin = "anonymous";
    script.async = true;
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(`${import.meta.env.VITE_KAKAO_JS_KEY}`);
      }
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
};

export default KakaoInit;
