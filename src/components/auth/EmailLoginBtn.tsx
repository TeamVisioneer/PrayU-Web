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
      className="flex justify-center items-center w-9 h-9 bg-gray-200 rounded-full"
      onClick={() => handleEmailLoginBtnClick()}
    >
      <MdEmail className="w-[18px] h-[18px] text-gray-500" />
    </button>
  );
};

export default EmailLoginBtn;
