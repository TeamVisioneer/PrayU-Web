import { cn } from "@/lib/utils";

interface FixedHeaderProps {
  className?: string;
}

const FixedHeader: React.FC<FixedHeaderProps> = ({ className }) => {
  return (
    <header
      className={cn(
        "fixed top-0 max-w-[480px] mx-auto w-full bg-mainBg z-50 border-y border-l-gray-500",
        className
      )}
    >
      <div className="flex justify-between items-center py-2 px-4">
        <a href="/" className="flex items-center gap-2">
          <img src="/images/PrayULogo.png" className="w-5 h-5" />
          <h1 className="text-lg font-bold">PrayU</h1>
        </a>
      </div>
    </header>
  );
};

export default FixedHeader;
