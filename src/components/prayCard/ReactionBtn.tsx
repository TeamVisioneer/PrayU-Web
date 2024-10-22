import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import { PrayCardWithProfiles } from "supabase/types/tables";
import useBaseStore from "@/stores/baseStore";
import { analyticsTrack } from "@/analytics/analytics";
import { KakaoController } from "../kakao/KakaoController";
import { sleep } from "@/lib/utils";
import { useToast } from "../ui/use-toast";
import { PrayReactionMessage } from "../kakao/KakaoMessage";
import { NotificationType } from "../notification/NotificationType";

interface ReactionBtnProps {
  currentUserId: string;
  prayCard: PrayCardWithProfiles;
  eventOption: { where: string; total_member: number };
}

const ReactionBtn: React.FC<ReactionBtnProps> = ({
  currentUserId,
  prayCard,
  eventOption,
}) => {
  const { toast } = useToast();
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const myMember = useBaseStore((state) => state.myMember);
  const todayPrayTypeHash = useBaseStore((state) => state.todayPrayTypeHash);
  const isPrayToday = useBaseStore((state) => state.isPrayToday);
  const isPrayTodayForMember = useBaseStore(
    (state) => state.isPrayTodayForMember
  );
  const prayCardCarouselApi = useBaseStore(
    (state) => state.prayCardCarouselApi
  );
  const createPray = useBaseStore((state) => state.createPray);
  const updatePray = useBaseStore((state) => state.updatePray);
  const setIsPrayToday = useBaseStore((state) => state.setIsPrayToday);
  const setIsPrayTodayForMember = useBaseStore(
    (state) => state.setIsPrayTodayForMember
  );
  const createNotification = useBaseStore((state) => state.createNotification);

  const hasPrayed = Boolean(todayPrayTypeHash[prayCard.id]);

  const handleClick = async (prayType: PrayType) => {
    if (!isPrayToday) setIsPrayToday(true);
    if (!isPrayTodayForMember && prayCard.user_id !== currentUserId) {
      setIsPrayTodayForMember(true);
    }

    if (!hasPrayed) {
      const newPray = await createPray(prayCard.id, currentUserId, prayType);
      if (!newPray) return null;

      await createNotification({
        userId: prayCard.user_id ? [prayCard.user_id] : [],
        senderId: currentUserId,
        groupId: targetGroup!.id,
        title: "PrayU 기도 알림",
        body: `${targetGroup!.name} 그룹에서 당신을 위해 기도해 주었어요`,
        type: NotificationType.SNS,
        data: {
          praycard_id: prayCard.id,
          pray_id: newPray.id,
          pray_type: prayType,
        },
      });

      // TODO: 카카오 메세지 재기획 이후 진행
      const kakaoMessageEnabled = false;
      if (kakaoMessageEnabled) {
        if (
          prayCard.profiles.kakao_id &&
          myMember?.profiles.kakao_notification
        ) {
          const response = await KakaoController.sendDirectMessage(
            PrayReactionMessage(myMember?.profiles.full_name, targetGroup!.id),
            prayCard.profiles.kakao_id
          );
          if (response && response.successful_receiver_uuids.length > 0) {
            toast({
              description: `📮 ${prayCard.profiles.full_name}님에게 기도 알림 메세지를 보냈어요`,
            });
          }
        }
      }
    } else updatePray(prayCard.id, currentUserId, prayType);

    if (prayCardCarouselApi) {
      sleep(1000).then(() => {
        prayCardCarouselApi.scrollNext();
      });
    }

    analyticsTrack("클릭_기도카드_반응", {
      pray_type: prayType,
      where: eventOption.where,
      total_member: eventOption.total_member,
    });
  };

  return (
    <div className="flex justify-center gap-8">
      {Object.values(PrayType).map((type) => {
        const emojiData = PrayTypeDatas[type];
        return (
          <button
            key={type}
            onClick={() => handleClick(type as PrayType)}
            className={`flex justify-center items-center w-16 h-16 rounded-full duration-1000 ease-in-out ${
              emojiData.bgColor
            } ${
              !hasPrayed
                ? `opacity-90 ${emojiData.shadowColor}`
                : todayPrayTypeHash[prayCard.id] == type
                ? `opacity-90 ring-4 ring-offset-2 ${emojiData.ringColor}`
                : `opacity-20 ${emojiData.shadowColor}`
            }`}
            disabled={todayPrayTypeHash[prayCard.id] == type}
          >
            <img src={emojiData.icon} className="w-9 h-9" />
          </button>
        );
      })}
    </div>
  );
};

export default ReactionBtn;
