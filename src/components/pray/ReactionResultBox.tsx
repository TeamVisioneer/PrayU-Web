import { analyticsTrack } from "@/analytics/analytics";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import useBaseStore from "@/stores/baseStore";
import { PrayCardWithProfiles } from "supabase/types/tables";
import UserMono from "@/assets/icon-user-mono.svg";

interface ReactionResultProps {
  prayCard: PrayCardWithProfiles | undefined;
  variant?: "separated" | "combined";
  eventOption: { where: string };
}

const ReactionResultBox: React.FC<ReactionResultProps> = ({
  prayCard,
  variant = "separated",
  eventOption,
}) => {
  const user = useBaseStore((state) => state.user);
  const targetGroup = useBaseStore((state) => state.targetGroup);

  const fetchUserPrayCardListByGroupId = useBaseStore(
    (state) => state.fetchUserPrayCardListByGroupId
  );
  const fetchTodayUserPrayByGroupId = useBaseStore(
    (state) => state.fetchTodayUserPrayByGroupId
  );
  const setIsOpenMyPrayDrawer = useBaseStore(
    (state) => state.setIsOpenMyPrayDrawer
  );
  const setTargetPrayCard = useBaseStore((state) => state.setTargetPrayCard);

  const onClickMyMemberReaction = async (event: {
    stopPropagation: () => void;
  }) => {
    if (!user || !targetGroup) return;
    event.stopPropagation();
    setTargetPrayCard(prayCard || null);
    fetchUserPrayCardListByGroupId(user.id, targetGroup.id);
    fetchTodayUserPrayByGroupId(user.id, targetGroup.id);
    setIsOpenMyPrayDrawer(true);
    analyticsTrack("클릭_기도카드_반응결과", eventOption);
  };

  if (variant === "combined") {
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
                {prayCard?.pray?.filter((pray) => pray.pray_type === type)
                  .length || 0}
              </p>
            </div>
          );
        })}
      </div>
    );
  }
  if (variant === "separated") {
    return (
      <div
        className="flex justify-center focus:outline-none gap-2 mt-4"
        onClick={(event) => onClickMyMemberReaction(event)}
      >
        {Object.values(PrayType).map((type) => (
          <div
            key={type}
            className="w-[60px] py-1 px-2 flex rounded-lg bg-white text-black gap-2"
          >
            <div className="text-sm w-5 h-5">
              <img
                src={PrayTypeDatas[type].img}
                alt={PrayTypeDatas[type].emoji}
                className="w-5 h-5"
              />
            </div>
            <div className="text-sm">
              {prayCard?.pray?.filter((pray) => pray.pray_type === type)
                .length || 0}
            </div>
          </div>
        ))}
        <div className="bg-white rounded-lg flex justify-center items-center p-1">
          <img className="w-5" src={UserMono} />
        </div>
      </div>
    );
  }
};

export default ReactionResultBox;
