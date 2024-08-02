import useBaseStore from "@/stores/baseStore";
import { Button } from "../ui/button";

interface OpenShareDrawerBtnProps {
  message: string;
  iconUrl?: string;
}

const OpenShareDrawerBtn: React.FC<OpenShareDrawerBtnProps> = ({
  message,
  iconUrl,
}) => {
  const setIsOpenShareDrawer = useBaseStore(
    (state) => state.setIsOpenShareDrawer
  );
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt="share"
        onClick={() => setIsOpenShareDrawer(true)}
      />
    );
  }
  return (
    <Button
      variant="primary"
      className="w-32"
      onClick={() => setIsOpenShareDrawer(true)}
    >
      {message}
    </Button>
  );
};

export default OpenShareDrawerBtn;
