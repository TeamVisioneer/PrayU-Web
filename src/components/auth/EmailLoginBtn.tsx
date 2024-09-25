import { analytics } from "@/analytics/analytics";
import useBaseStore from "@/stores/baseStore";
import { MdEmail } from "react-icons/md";

const EmailLoginBtn: React.FC = () => {
  const setIsEmailLoginDialogOpen = useBaseStore(
    (state) => state.setIsEmailLoginDialogOpen
  );
  const setIsOpenLoginDrawer = useBaseStore(
    (state) => state.setIsOpenLoginDrawer
  );
  const handleEmailLoginBtnClick = async () => {
    analytics.track("클릭_이메일_로그인", { where: "EmailLoginBtn" });
    setIsOpenLoginDrawer(false);
    setTimeout(() => {
      setIsEmailLoginDialogOpen(true);
    }, 100);
  };

  return (
    <button
      className="w-full flex justify-between items-center gap-3 px-4 py-2 rounded-lg text-sm border-gray-200 border-2 bg-gray-200"
      onClick={() => handleEmailLoginBtnClick()}
    >
      <MdEmail className="w-[18px] h-[18px] text-gray-500" />
      <div className="flex-grow text-gray-500">이메일로 시작하기</div>
    </button>
  );
};

export default EmailLoginBtn;
