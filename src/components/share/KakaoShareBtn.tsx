import { analyticsTrack } from "@/analytics/analytics";
import { getDomainUrl, getISOTodayDateYMD } from "@/lib/utils";
import { KakaoLinkObject } from "../kakao/Kakao";
import { Button } from "../ui/button";

interface EventOption {
  where: string;
}

interface KakaoShareButtonProps {
  className?: string;
  buttonText: string;
  kakaoLinkObject: KakaoLinkObject;
  eventOption: EventOption;
}

export const KakaoShareButton: React.FC<KakaoShareButtonProps> = ({
  className,
  buttonText,
  kakaoLinkObject,
  eventOption,
}) => {
  const handleClickKakaoBtn = () => {
    analyticsTrack("클릭_카카오_공유", { where: eventOption.where });
    window.Kakao.Share.sendDefault(kakaoLinkObject);
  };

  return (
    <Button
      variant="primary"
      className={className}
      onClick={() => handleClickKakaoBtn()}
    >
      {buttonText}
    </Button>
  );
};

// KakaoLinkObject

export const BibleCardLink = () => {
  const today = getISOTodayDateYMD();
  const contentNumber = parseInt(today.day, 10) % 31;
  const domainUrl = getDomainUrl();
  return {
    objectType: "feed",
    content: {
      title: `${today.year}.${today.month}.${today.day} 오늘의 말씀`,
      description: "PrayU 에서 말씀과 함께 기도해요!",
      imageUrl: `https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/BibleContent/content${contentNumber}.png`,
      link: { webUrl: domainUrl, mobileWebUrl: domainUrl },
    },
    buttons: [
      {
        title: "오늘의 기도 시작하기",
        link: { webUrl: domainUrl, mobileWebUrl: domainUrl },
      },
    ],
  } as KakaoLinkObject;
};

export const GroupInviteLink = (groupName: string) => {
  return {
    objectType: "feed",
    content: {
      title: "PrayU 그룹 초대 알림",
      description: `${groupName} 그룹에 초대 되었어요!\nPrayU 에서 매일의 기도를 시작해요`,
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
      description: `기도를 기다리는 기도제목들이 있어요!`,
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
      description: `이번 주 기도제목을 작성해 주세요🙏`,
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
