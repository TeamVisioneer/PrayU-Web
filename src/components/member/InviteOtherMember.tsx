import { analyticsTrack } from "@/analytics/analytics";
import useBaseStore from "@/stores/baseStore";
import { IoMdPersonAdd } from "react-icons/io";

const InviteOtherMember = () => {
  const setIsOpenShareDrawer = useBaseStore(
    (state) => state.setIsOpenShareDrawer
  );

  const onClickDummyOtherMember = () => {
    setIsOpenShareDrawer(true);
    analyticsTrack("클릭_멤버_초대", {});
  };

  return (
    <div
      className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer  h-32"
      onClick={() => {
        onClickDummyOtherMember();
      }}
    >
      <div className="flex flex-col items-center gap-2 py-1">
        <IoMdPersonAdd size={40} className="text-gray-400" />
        <p className="text-gray-400">그룹원 초대하기</p>
      </div>
    </div>
  );
};

export default InviteOtherMember;
