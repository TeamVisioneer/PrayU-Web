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
  const handleClickSharBtn = () => {
    setIsOpenShareDrawer(true);
    analyticsTrack("클릭_공유_그룹초대", { where: eventOption.where });
  };
  if (type == "button")
    return (
      <Button
        variant="primary"
        className="w-32"
        onClick={() => handleClickSharBtn()}
      >
        {text}
      </Button>
    );
  if (type == "tag")
    return (
      <div className="flex items-center gap-1 text-[12px]">
        <img src={inviteIcon} className="w-[10px] h-[10px]" />
        <span>{text}</span>
      </div>
    );
};

export default OpenShareDrawerBtn;
