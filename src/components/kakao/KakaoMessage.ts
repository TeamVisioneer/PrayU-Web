import { getDomainUrl } from "@/lib/utils";
import { KakaoMessageObject } from "./Kakao";

const baseUrl = getDomainUrl();

export const RequestPrayMessage = (groupName: string | null) => {
  return {
    object_type: "feed",
    content: {
      title: "💌 PrayU 기도요청",
      description: `${groupName || ""}그룹
        에서 요청된 기도제목이 있어요`,
      image_url:
        "https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/PrayCardPrayU.png",
      image_width: 800,
      image_height: 600,
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
