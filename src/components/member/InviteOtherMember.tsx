import { analyticsTrack } from "@/analytics/analytics";
import useBaseStore from "@/stores/baseStore";
import { UserRoundPlus } from "lucide-react";

const InviteOtherMember = () => {
  const setIsOpenShareDrawer = useBaseStore(
    (state) => state.setIsOpenShareDrawer
  );

  const onClickDummyOtherMember = () => {
    setIsOpenShareDrawer(true);
    analyticsTrack("클릭_멤버_초대", {});
  };

  return (
    <button
      type="button"
      onClick={() => onClickDummyOtherMember()}
      className="flex h-32 w-full items-center justify-center gap-1.5 rounded-[1.25rem] border border-dashed border-accentFrom/40 bg-white/50 font-semibold text-accentFrom transition-all duration-150 active:scale-[0.98]"
    >
      <UserRoundPlus size={18} strokeWidth={2.4} />
      그룹원 초대하기
    </button>
  );
};

export default InviteOtherMember;
