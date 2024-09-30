import { analyticsTrack } from "@/analytics/analytics";
import { getISOTodayDateYMD } from "@/lib/utils";
import { KakaoLinkObject } from "../kakao/Kakao";

interface EventOption {
  where: string;
}

interface KakaoShareButtonProps {
  buttonText: string;
  kakaoLinkObject: KakaoLinkObject;
  eventOption: EventOption;
}

export const KakaoShareButton: React.FC<KakaoShareButtonProps> = ({
  buttonText,
  kakaoLinkObject,
  eventOption,
}) => {
  const handleClickKakaoBtn = () => {
    analyticsTrack("클릭_카카오_공유", { where: eventOption.where });
    window.Kakao.Share.sendDefault(kakaoLinkObject);
  };

  return (
    <button
      className="bg-yellow-300 px-10 py-2 rounded-md text-sm"
      onClick={() => handleClickKakaoBtn()}
    >
      {buttonText}
    </button>
  );
};

// KakaoLinkObject

export const BibleCardLink = () => {
  const today = getISOTodayDateYMD();
  const contentNumber = parseInt(today.day, 10) % 31;
  return {
    objectType: "feed",
    content: {
      title: `${today.year}.${today.month}.${today.day} PrayU 오늘의 말씀카드`,
      description: "PrayU 에서 오늘의 말씀과 함께 기도해요!",
      imageUrl: `https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/BibleContent/content${contentNumber}.png`,
      link: {
        webUrl: window.location.href,
        mobileWebUrl: window.location.href,
      },
    },
    buttons: [
      {
        title: "오늘의 기도 시작하기",
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
    ],
  } as KakaoLinkObject;
};

export const GroupInviteLink = (groupName: string) => {
  return {
    objectType: "feed",
    content: {
      title: "PrayU 그룹 초대 알림",
      description: `${groupName} 그룹에 초대 되었어요!\nPrayU 와 함께 기도생활을 시작해보아요`,
      imageUrl:
        "https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/intro_800_500.png",
      imageWidth: 800,
      imageHeight: 500,
      link: {
        webUrl: window.location.href,
        mobileWebUrl: window.location.href,
      },
    },
    buttons: [
      {
        title: "그룹 입장하기",
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
    ],
  } as KakaoLinkObject;
};

export const TodayPrayLink = () => {
  return {
    objectType: "feed",
    content: {
      title: "PrayU 오늘의 기도 알림",
      description: `아직 오늘의 기도를 진행하지 않으셨나요?\n기도를 완료하고 내게 기도해준 친구를 확인해보아요!`,
      imageUrl:
        "https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/notification.png",
      imageWidth: 400,
      imageHeight: 240,
      link: {
        webUrl: window.location.href,
        mobileWebUrl: window.location.href,
      },
    },
    buttons: [
      {
        title: "오늘의 기도 시작하기",
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
    ],
  } as KakaoLinkObject;
};

export const ExpiredMemberLink = () => {
  return {
    objectType: "feed",
    content: {
      title: "PrayU 기도카드 작성 알림",
      description: `일주일이 지나 새로운 기도카드가 필요해요\n기도카드를 올리고 이번 주 기도를 받아 보아요!`,
      imageUrl:
        "https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/expired.png",
      imageWidth: 400,
      imageHeight: 240,
      link: {
        webUrl: window.location.href,
        mobileWebUrl: window.location.href,
      },
    },
    buttons: [
      {
        title: "기도카드 작성하기",
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
    ],
  } as KakaoLinkObject;
};
