import { analyticsTrack } from "@/analytics/analytics";
import { useNavigate } from "react-router-dom";

const EmptyMyMember = () => {
  const navigate = useNavigate();

  const onClickMyMember = async () => {
    navigate("/praycard/new");
    analyticsTrack("클릭_멤버_본인", {
      where: "EmptyMyMember",
    });
  };

  return (
    <div
      onClick={() => onClickMyMember()}
      className="w-full flex flex-col gap-3 cursor-pointer bg-white p-6 rounded-[15px]"
    >
      <div className="flex flex-col gap-1">
        <h3 className="flex font-bold text-lg">내 기도카드</h3>
        <div className="text-left py-2">
          <div className="flex items-center gap-1.5 text-indigo-600 text-sm font-medium">
            <span>✏️</span>
            <span>기도카드에 일상과 기도제목을 작성해 보아요</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyMyMember;
