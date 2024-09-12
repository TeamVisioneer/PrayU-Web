import { getDomainUrl } from "@/lib/utils";
import { KakaoMessageObject } from "./Kakao";

const baseUrl = getDomainUrl();

export const PrayRequestMessage = (userName: string | null) => {
  return {
    object_type: "feed",
    content: {
      title: "💌 PrayU 기도요청",
      description: `${userName || ""}님이 요청한 기도제목이 있어요!`,
      image_url: "",
      link: { web_url: baseUrl, mobile_web_url: baseUrl },
    },
    buttons: [
      {
        title: "오늘의 기도 시작",
        link: {
          mobile_web_url: window.location.href,
          web_url: window.location.href,
        },
      },
    ],
  } as KakaoMessageObject;
};
