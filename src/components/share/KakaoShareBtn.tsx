import { analyticsTrack } from "@/analytics/analytics";
import { getDomainUrl, getISOTodayDateYMD } from "@/lib/utils";
import { Group } from "supabase/types/tables";

interface EventOption {
  where: string;
}

interface KakaoShareButtonProps {
  targetGroup: Group | null;
  message: string;
  eventOption: EventOption;
  type?: string;
}

const getContent = (groupName: string, type: string) => {
  const today = getISOTodayDateYMD();
  const contentNumber = parseInt(today.day, 10) % 10;
  switch (type) {
    case "bible":
      return {
        title: `${today.year}.${today.month}.${today.day} 오늘의 말씀`,
        description: "PrayU에서 오늘의 말씀과 함께 기도해요!",
        imageUrl: `https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/BibleContent/content${contentNumber}.png`,
      };
    default:
      return {
        title: `PrayU - ${groupName}`,
        description: "우리만의 기도제목 나눔 공간\nPrayU에서 함께 기도해요🙏",
        imageUrl:
          "https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/introImage.png",
      };
  }
};

export const KakaoShareButton: React.FC<KakaoShareButtonProps> = ({
  targetGroup,
  message,
  type = "default",
  eventOption,
}) => {
  const domainUrl = getDomainUrl();
  const groupUrl = `${domainUrl}/group/${targetGroup!.id}`;
  const content = getContent(targetGroup!.name!, type);
  const handleClickKakaoBtn = () => {
    analyticsTrack("클릭_카카오_공유", {
      where: eventOption.where,
    });
    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: content.title,
        description: content.description,
        imageUrl: content.imageUrl,
        link: {
          mobileWebUrl: groupUrl,
          webUrl: groupUrl,
        },
      },
      buttons: [
        {
          title: "오늘의 기도",
          link: {
            mobileWebUrl: groupUrl,
            webUrl: groupUrl,
          },
        },
      ],
    });
  };

  return (
    <button
      className="bg-yellow-300 px-10 py-2 rounded-md text-sm"
      onClick={() => handleClickKakaoBtn()}
    >
      {message}
    </button>
  );
};
