import { analyticsTrack } from "@/analytics/analytics";
import useBaseStore from "@/stores/baseStore";

const DummyOtherMember: React.FC = () => {
  const setIsOpenShareDrawer = useBaseStore(
    (state) => state.setIsOpenShareDrawer
  );

  const onClickDummyOtherMember = () => {
    setIsOpenShareDrawer(true);
    analyticsTrack("클릭_멤버_더미맴버", {});
  };

  return (
    <div
      className="flex flex-col gap-[10px] cursor-pointer bg-white p-5 rounded-2xl"
      onClick={() => onClickDummyOtherMember()}
    >
      <div className="flex items-center gap-2">
        <img
          className="w-8 h-8 rounded-full object-cover"
          src={"/images/defaultProfileImage.png"}
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            e.currentTarget.src = "/images/defaultProfileImage.png";
          }}
        />
        <p>기도 친구</p>
      </div>
      <div className="text-left text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis w-full block">
        PrayU 를 통해 많은 사람들이 기도할 수 있도록 🙏🏻
      </div>
      <div className="text-gray-400 text-left text-xs">오늘</div>
    </div>
  );
};

export default DummyOtherMember;
