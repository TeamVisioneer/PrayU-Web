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
}

const OpenShareDrawerBtn: React.FC<OpenShareDrawerBtnProps> = ({
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
  const handleClickSharBtn = () => {
    setIsOpenTodayPrayDrawer(false);
    setIsOpenShareDrawer(true);
    analyticsTrack("클릭_공유_그룹초대", { where: eventOption.where });
  };

  if (type == "button")
    return (
      <Button
        variant="primary"
        className="w-[166px] h-[48px] text-md font-bold rounded-[10px] cursor-pointer"
        onClick={() => handleClickSharBtn()}
      >
        {text}
      </Button>
    );
  if (type == "tag")
    return (
      <div
        className="w-[48px] flex items-center gap-1 text-[12px] cursor-pointer"
        onClick={() => handleClickSharBtn()}
      >
        <img src={inviteIcon} className="w-[10px] h-[10px]" />
        <span>{text}</span>
      </div>
    );
};

export default OpenShareDrawerBtn;
