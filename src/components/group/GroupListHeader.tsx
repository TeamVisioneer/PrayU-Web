import GroupMenuBtn from "./GroupMenuBtn";
import NotificationBtn from "../notification/NotificationBtn";
import { useNavigate } from "react-router-dom";

const GroupListHeader: React.FC = () => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 flex items-center justify-between p-5 z-10 border-b border-gray-200 bg-mainBg">
      <h1
        onClick={() => {
          navigate("/office/union");
        }}
        className="text-xl font-bold text-[#222222]"
      >
        그룹 홈
      </h1>
      <div className="flex items-center gap-2">
        <NotificationBtn />
        <GroupMenuBtn />
      </div>
    </header>
  );
};

export default GroupListHeader;
