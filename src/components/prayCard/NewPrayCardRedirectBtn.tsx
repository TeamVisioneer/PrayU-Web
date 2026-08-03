import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { analyticsTrack } from "@/analytics/analytics";

const NewPrayCardRedirectBtn: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Button
      className={`bg-gradient-to-br from-accentFrom to-accentTo hover:from-accentFrom/90 hover:to-accentTo/90 
                  text-white px-8 py-5 h-auto rounded-full transition-all duration-300 shadow-lg
                  active:scale-95 transform`}
      onClick={() => {
        navigate("/praycard/new");
        analyticsTrack("클릭_기도카드_만들기", {
          where: "NewPrayCardRedirectBtn",
        });
      }}
    >
      <span className="text-lg font-medium">기도카드 만들기</span>
    </Button>
  );
};

export default NewPrayCardRedirectBtn;
