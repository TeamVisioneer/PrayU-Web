import useBaseStore from "@/stores/baseStore";
import { Button } from "../ui/button";
import { analyticsTrack } from "@/analytics/analytics";
import inviteIcon from "@/assets/icon-invite.png";

interface EventOption {
  where: string;
}

interface OpenShareDrawerBtnProps {
  text: string;
  eventOption: EventOption;
  type?: "button" | "tag";
  className?: string;
}

const OpenShareDrawerBtn: React.FC<OpenShareDrawerBtnProps> = ({
  className,
  text,
  eventOption,
  type = "button",
}) => {
  const setIsOpenShareDrawer = useBaseStore(
    (state) => state.setIsOpenShareDrawer
  );
  const setIsOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setIsOpenTodayPrayDrawer
  );
  const setIsOpenBannerDialog = useBaseStore(
    (state) => state.setIsOpenBannerDialog
  );

  const handleClickSharBtn = () => {
    setIsOpenBannerDialog(false);
    setIsOpenTodayPrayDrawer(false);
    setIsOpenShareDrawer(true);
    analyticsTrack("클릭_공유_그룹초대", { where: eventOption.where });
  };

  if (type == "button")
    return (
      <Button
        variant="primary"
        className={className}
        onClick={() => handleClickSharBtn()}
      >
        {text}
      </Button>
    );
  if (type == "tag")
    return (
      <div
        className="w-[48px] flex items-center gap-1 cursor-pointer"
        onClick={() => handleClickSharBtn()}
      >
        <img src={inviteIcon} className="w-[16px] h-[16px]" />
        <span className="text-[14px]">{text}</span>
      </div>
    );
};

export default OpenShareDrawerBtn;
