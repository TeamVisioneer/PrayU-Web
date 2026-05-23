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
        title: "PrayU 시작하기",
        link: { webUrl: domainUrl, mobileWebUrl: domainUrl },
      },
    ],
  } as KakaoLinkObject;
};

export const GroupInviteLink = (groupId: string, groupName: string) => {
  const origin = window.location.origin;
  const joinUrl = `${origin}/group/${groupId}/join`;

  return {
    objectType: "feed",
    content: {
      title: "PrayU 그룹 초대 알림",
      description: `${groupName}에 초대 되었어요!\nPrayU 에서 매일의 기도를 시작해요`,
      imageUrl:
        "https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/invite.png",
      imageWidth: 400,
      imageHeight: 240,
      link: {
        webUrl: joinUrl,
        mobileWebUrl: joinUrl,
      },
    },
    buttons: [
      {
        title: "그룹 입장하기",
        link: {
          mobileWebUrl: joinUrl,
          webUrl: joinUrl,
        },
      },
    ],
  } as KakaoLinkObject;
};

export const UnionInviteLink = (unionName: string, unionId: string) => {
  return {
    objectType: "feed",
    content: {
      title: "PrayU 공동체 등록 요청 알림",
      description: `${unionName}에서 등록 요청이 왔어요\n요청을 수락해 주세요!`,
      imageUrl:
        "https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu//KakaoUnionInvite.png",
      imageWidth: 400,
      imageHeight: 240,
      link: {
        webUrl: `${window.location.origin}/office/union/${unionId}/join`,
        mobileWebUrl: `${window.location.origin}/office/union/${unionId}/join`,
      },
    },
    buttons: [
      {
        title: "요청 수락하기",
        link: {
          mobileWebUrl: `${window.location.origin}/office/union/${unionId}/join`,
          webUrl: `${window.location.origin}/office/union/${unionId}/join`,
        },
      },
    ],
  } as KakaoLinkObject;
};

export const TodayPrayLink = () => {
  const origin = window.location.origin;
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
        webUrl: origin,
        mobileWebUrl: origin,
      },
    },
    buttons: [
      {
        title: "오늘의 기도 시작하기",
        link: {
          mobileWebUrl: origin,
          webUrl: origin,
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

export const PlayListShareLink = () => {
  const domainUrl = getDomainUrl();

  return {
    objectType: "feed",
    content: {
      title: "PrayU PlayList Vol.1 도착 🎁",
      description: `찬양을 들으면서 말씀과 묵상을 확인해보세요`,
      imageUrl:
        "https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/PrayUPlayList/PlayListCover.png",
      link: {
        webUrl: domainUrl,
        mobileWebUrl: domainUrl,
      },
    },
    buttons: [
      {
        title: "YOUTUBE",
        link: {
          mobileWebUrl:
            "https://www.youtube.com/playlist?list=PLMvKO5tSXWuyv_KRi49TQmZ82kd3s4OVq",
          webUrl:
            "https://www.youtube.com/playlist?list=PLMvKO5tSXWuyv_KRi49TQmZ82kd3s4OVq",
        },
      },
      {
        title: "PDF 보기",
        link: {
          mobileWebUrl:
            "https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/PrayUPlayList/PrayU_PlayList_Vol_1.pdf",
          webUrl:
            "https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/PrayUPlayList/PrayU_PlayList_Vol_1.pdf",
        },
      },
    ],
  } as KakaoLinkObject;
};

export const UserBibleCardLink = (publicUrl: string, shareUrl?: string) => {
  const domainUrl = getDomainUrl();
  const bibleCardPage = shareUrl || `${domainUrl}/bible-card`;
  return {
    objectType: "feed",

    content: {
      title: "PrayU 말씀카드",
      description: "기도제목에 맞는 나만의 말씀카드를 만들어 보아요",
      imageUrl: publicUrl,
      imageWidth: 400,
      imageHeight: 800,
      link: { webUrl: bibleCardPage, mobileWebUrl: bibleCardPage },
    },
    buttons: [
      {
        title: "말씀카드 만들기",
        link: { webUrl: bibleCardPage, mobileWebUrl: bibleCardPage },
      },
    ],
  } as KakaoLinkObject;
};
