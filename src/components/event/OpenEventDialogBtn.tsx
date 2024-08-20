import useBaseStore from "@/stores/baseStore";
import giftIcon from "@/assets/gift.svg";

const OpenEventDialogBtn = () => {
  const setIsOpenEventDialog = useBaseStore(
    (state) => state.setIsOpenEventDialog
  );

  const onClickEventDialogBtn = () => {
    setIsOpenEventDialog(true);
  };

  return (
    <div className="w-8 h-8" onClick={() => onClickEventDialogBtn()}>
      <img className="w-full h-fulll" src={giftIcon}></img>
    </div>
  );
};

export default OpenEventDialogBtn;
