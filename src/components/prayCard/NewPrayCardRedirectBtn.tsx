import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { analyticsTrack } from "@/analytics/analytics";
import { FileEdit, Sparkles } from "lucide-react";

const NewPrayCardRedirectBtn: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Button
      className={`bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-500 hover:via-blue-600 hover:to-indigo-700 
                  text-white px-8 py-5 h-auto rounded-full transition-all duration-300 shadow-lg
                  active:scale-95 transform`}
      onClick={() => {
        navigate("/praycard/new");
        analyticsTrack("클릭_기도카드_만들기", {
          where: "NewPrayCardRedirectBtn",
        });
      }}
    >
      <div className="flex items-center gap-2 relative">
        <Sparkles className="h-5 w-5 absolute -left-1 -top-1 text-yellow-300" />
        <FileEdit className="mr-2 h-5 w-5" />
        <span className="text-lg font-medium">기도카드 만들기</span>
      </div>
    </Button>
  );
};

export default NewPrayCardRedirectBtn;
