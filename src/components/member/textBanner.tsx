import { CheckCircle2 } from "lucide-react";

interface TextBannerProps {
  text: string;
}

const TextBanner: React.FC<TextBannerProps> = ({ text }) => {
  return (
    <div className="w-full opacity-80 bg-white/80 text-blue-500 px-4 py-1.5 rounded-md text-xs flex items-center justify-center gap-1">
      <CheckCircle2 className="h-4 w-4 text-blue-500" />
      <span>{text}</span>
    </div>
  );
};

export default TextBanner;
