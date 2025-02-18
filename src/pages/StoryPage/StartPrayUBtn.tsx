import { Button } from "../../components/ui/button";
import { analyticsTrack } from "@/analytics/analytics";

interface EventOption {
  where: string;
}
interface StartPrayUBtnProps {
  eventOption: EventOption;
}

const StartPrayUBtn: React.FC<StartPrayUBtnProps> = ({ eventOption }) => {
  const onClickStartPrayUBtn = async () => {
    analyticsTrack("클릭_PrayU_시작", { where: eventOption.where });
    if (navigator.userAgent.match(/Android/i)) {
      window.location.href =
        "https://play.google.com/store/apps/details?id=com.team.visioneer.prayu";
    } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
      window.location.href =
        "https://itunes.apple.com/kr/app/apple-store/id6711345171";
    } else {
      window.location.href = "https://linktr.ee/prayu.site";
    }
  };

  return (
    <Button
      variant="primary"
      className={`w-[188px] h-[46px] text-md ${
        eventOption.where == "floatingBtn"
          ? "rounded-[100px]"
          : "rounded-[10px]"
      }`}
      onClick={() => onClickStartPrayUBtn()}
    >
      PrayU 지금 시작
    </Button>
  );
};

export default StartPrayUBtn;
