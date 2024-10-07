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
    window.location.href = import.meta.env.VITE_LANDING_URL;
  };

  return (
    <Button
      variant="landing"
      className={`w-[188px] h-[46px] text-md font-bold ${
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
