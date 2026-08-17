import { analyticsTrack } from "@/analytics/analytics";
import useBaseStore from "@/stores/baseStore";

const DummyOtherMember: React.FC = () => {
  const setIsOpenOtherMemberDrawer = useBaseStore(
    (state) => state.setIsOpenOtherMemberDrawer
  );

  const onClickDummyOtherMember = () => {
    setIsOpenOtherMemberDrawer(true);
    analyticsTrack("클릭_멤버_더미맴버", {});
  };

  return (
    <div
      className="flex flex-col gap-[10px] cursor-pointer border border-glassBorder/50 bg-surfaceCard/70 shadow-member p-5 rounded-2xl h-32"
      onClick={() => onClickDummyOtherMember()}
    >
      <div className="flex items-center gap-2">
        <img
          className="w-8 h-8 rounded-full object-cover"
          src="/images/avatar/avatar_1.png"
        />
        <p>김프유</p>
      </div>
      <div className="text-left text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis w-full block">
        (예시)PrayU 를 통해 많은 사람들이 기도할 수 있도록 🙏🏻
      </div>
      <div className="text-gray-400 text-left text-xs">오늘</div>
    </div>
  );
};

export default DummyOtherMember;
