import { analyticsTrack } from "@/analytics/analytics";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import useBaseStore from "@/stores/baseStore";
import { PrayWithProfiles } from "supabase/types/tables";

interface ReactionResultType1Props {
  prayData: PrayWithProfiles[];
  eventOption: { where: string };
}

const ReactionResultBox: React.FC<ReactionResultType1Props> = ({
  prayData,
  eventOption,
}) => {
  const user = useBaseStore((state) => state.user);
  const targetGroup = useBaseStore((state) => state.targetGroup);

  const fetchUserPrayCardListByGroupId = useBaseStore(
    (state) => state.fetchUserPrayCardListByGroupId
  );
  const setIsOpenMyPrayDrawer = useBaseStore(
    (state) => state.setIsOpenMyPrayDrawer
  );

  const onClickMyMemberReaction = (event: { stopPropagation: () => void }) => {
    if (!user || !targetGroup) return;
    fetchUserPrayCardListByGroupId(user.id, targetGroup.id);
    setIsOpenMyPrayDrawer(true);
    event.stopPropagation();
    analyticsTrack("클릭_기도카드_반응결과", eventOption);
  };

  return (
    <div
      className="w-fit flex bg-gray-100 rounded-lg px-[12px] py-2 gap-[16px]"
      onClick={(event) => onClickMyMemberReaction(event)}
    >
      {Object.values(PrayType).map((type) => {
        return (
          <div key={type} className="flex items-center gap-1 ">
            <img
              src={PrayTypeDatas[type].img}
              alt={PrayTypeDatas[type].emoji}
              className="w-5 h-5 opacity-90"
            />
            <p className="text-sm text-dark">
              {prayData.filter((pray) => pray.pray_type === type).length}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default ReactionResultBox;
