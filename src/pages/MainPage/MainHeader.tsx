import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MainHeaderProps {
  className?: string;
}

const MainHeader: React.FC<MainHeaderProps> = ({ className }) => {
  const onClickAppInstall = () => {
    if (navigator.userAgent.match(/Android/i)) {
      window.location.href =
        "https://play.google.com/store/apps/details?id=com.team.visioneer.prayu";
    } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
      window.location.href =
        "https://itunes.apple.com/kr/app/apple-store/id6711345171";
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 max-w-[480px] mx-auto w-full bg-mainBg z-50 border-y border-l-gray-500",
        className
      )}
    >
      <div className="flex justify-between items-center py-2 px-4">
        <a href="/" className="flex items-center gap-2">
          <img src="/images/PrayULogoV3.png" className="w-5 h-5" />
          <h1 className="text-lg font-bold">PrayU</h1>
        </a>
        {!navigator.userAgent.match(/prayu/i) && (
          <Badge
            variant="secondary"
            className="text-base font-normal border-gray-300 rounded-sm"
            onClick={() => onClickAppInstall()}
          >
            앱설치
          </Badge>
        )}
      </div>
    </header>
  );
};

export default MainHeader;
