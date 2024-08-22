import { analyticsTrack } from "@/analytics/analytics";
import useBaseStore from "@/stores/baseStore";
import { AiOutlineNotification } from "react-icons/ai";

const OpenEventDialogBtn = () => {
  const setIsOpenEventDialog = useBaseStore(
    (state) => state.setIsOpenEventDialog
  );

  const onClickEventDialogBtn = () => {
    setIsOpenEventDialog(true);
    analyticsTrack("클릭_공지", {});
  };

  return (
    <div
      className="relative w-fit h-fit cursor-pointer"
      onClick={onClickEventDialogBtn}
    >
      <AiOutlineNotification size={20} />
      <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full "></div>
    </div>
  );
};

export default OpenEventDialogBtn;
