import { analyticsTrack } from "@/analytics/analytics";
import { MdEmail } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const EmailLoginBtn: React.FC = () => {
  const navigate = useNavigate();

  const handleEmailLoginBtnClick = async () => {
    analyticsTrack("클릭_이메일_로그인", { where: "EmailLoginBtn" });
    navigate("/login/email");
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
