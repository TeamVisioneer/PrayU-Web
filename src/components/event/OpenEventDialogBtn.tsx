import useBaseStore from "@/stores/baseStore";
import { AiTwotoneNotification } from "react-icons/ai";

const OpenEventDialogBtn = () => {
  const setIsOpenEventDialog = useBaseStore(
    (state) => state.setIsOpenEventDialog
  );

  const onClickEventDialogBtn = () => {
    setIsOpenEventDialog(true);
  };

  return (
    <div
      className="relative w-fit h-fit cursor-pointer"
      onClick={onClickEventDialogBtn}
    >
      <AiTwotoneNotification size={20} />
      <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full "></div>
    </div>
  );
};

export default OpenEventDialogBtn;
