import { Button } from "@/components/ui/button";
import useBaseStore from "@/stores/baseStore";

const FixedHeader: React.FC = () => {
  const user = useBaseStore((state) => state.user);
  const setIsOpenLoginDrawer = useBaseStore(
    (state) => state.setIsOpenLoginDrawer
  );
  return (
    <header className="fixed top-0 max-w-[480px] mx-auto w-full bg-mainBg z-50 border-y border-l-gray-500">
      <div className="flex justify-between items-center py-2 px-4">
        <a href="/" className="flex items-center gap-2">
          <img src="/images/PrayULogo.png" className="w-5 h-5" />
          <h1 className="text-lg font-bold">PrayU</h1>
        </a>
        {!user && (
          <Button
            variant="primaryLight"
            className="h-8 text-xs shadow-none px-4 border border-gray-100"
            onClick={() => setIsOpenLoginDrawer(true)}
          >
            로그인
          </Button>
        )}
      </div>
    </header>
  );
};

export default FixedHeader;
