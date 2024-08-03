import useBaseStore from "@/stores/baseStore";
import { Button } from "../ui/button";
import { analyticsTrack } from "@/analytics/analytics";

interface EventOption {
  where: string;
}

interface OpenShareDrawerBtnProps {
  text: string;
  eventOption: EventOption;
  className?: string;
  type?: "primary" | "ghost";
}

const OpenShareDrawerBtn: React.FC<OpenShareDrawerBtnProps> = ({
  text,
  eventOption,
  className = "",
  type = "primary",
}) => {
  const setIsOpenShareDrawer = useBaseStore(
    (state) => state.setIsOpenShareDrawer
  );
  const handleClickSharBtn = () => {
    setIsOpenShareDrawer(true);
    analyticsTrack("클릭_공유_그룹초대", { where: eventOption.where });
  };
  return (
    <Button
      variant={type}
      className={className}
      onClick={() => handleClickSharBtn()}
    >
      {text}
    </Button>
  );
};

export default OpenShareDrawerBtn;
