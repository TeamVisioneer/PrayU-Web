import { analyticsTrack } from "@/analytics/analytics";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FaRegQuestionCircle } from "react-icons/fa";

interface InfoBtnProps {
  eventOption: {
    where: string;
  };
  text: string[];
  position?: "center" | "start" | "end";
}

const InfoBtn: React.FC<InfoBtnProps> = ({ text, eventOption, position }) => {
  return (
    <Popover>
      <PopoverTrigger
        onClick={() => analyticsTrack("클릭_추가설명", eventOption)}
      >
        <FaRegQuestionCircle size={14} className="text-gray-300" />
      </PopoverTrigger>
      <PopoverContent align={position} className="p-2 w-fit">
        {text.map((t, index) => (
          <div key={index}>
            <span className="text-sm text-gray-500">{t}</span>
            {index < text.length - 1 && <br />}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default InfoBtn;
