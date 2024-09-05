import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import { PrayCardWithProfiles } from "supabase/types/tables";
import useBaseStore from "@/stores/baseStore";
import { analyticsTrack } from "@/analytics/analytics";
import { KakaoMessageObject } from "../kakao/Kakao";
import { KakaoController } from "../kakao/KakaoController";
import { sleep } from "@/lib/utils";

interface EventOption {
  where: string;
}

interface ReactionBtnProps {
  currentUserId: string;
  prayCard: PrayCardWithProfiles;
  eventOption: EventOption;
}

const ReactionBtn: React.FC<ReactionBtnProps> = ({
  currentUserId,
  prayCard,
  eventOption,
}) => {
  const user = useBaseStore((state) => state.user);
  const todayPrayTypeHash = useBaseStore((state) => state.todayPrayTypeHash);
  const isPrayToday = useBaseStore((state) => state.isPrayToday);
  const prayCardCarouselApi = useBaseStore(
    (state) => state.prayCardCarouselApi
  );

  const createPray = useBaseStore((state) => state.createPray);
  const updatePray = useBaseStore((state) => state.updatePray);
  const setIsPrayToday = useBaseStore((state) => state.setIsPrayToday);

  const kakaoFriendList = useBaseStore((state) => state.kakaoFriendList);

  const currentUrl = window.location.href;
  const targetFriend = kakaoFriendList.find(
    (friend) => String(friend.id) === prayCard.profiles.kakao_id
  );
  const kakaoMessage: KakaoMessageObject = {
    object_type: "commerce",
    content: {
      title: "📮 PrayU 기도 알림",
      description: `${
        user && `${user.user_metadata.full_name}님이 `
      }당신을 위해 기도해주었어요`,
      image_url:
        "https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/ReactionIcon.png",
      link: {
        web_url: "https://prayu-staging.vercel.app",
        mobile_web_url: "https://prayu-staging.vercel.app",
      },
    },
    commerce: {
      regular_price: 10000, // 필수 항목이므로 더미 가격을 넣어줍니다.
    },
    buttons: [
      {
        title: "오늘의 기도 시작",
        link: {
          mobile_web_url: currentUrl,
          web_url: currentUrl,
        },
      },
    ],
  };

  const hasPrayed = Boolean(todayPrayTypeHash[prayCard.id]);

  const handleClick = (prayType: PrayType) => () => {
    if (!isPrayToday) setIsPrayToday(true);

    if (!hasPrayed) {
      createPray(prayCard.id, currentUserId, prayType);
    } else updatePray(prayCard.id, currentUserId, prayType);

    if (prayCardCarouselApi) {
      sleep(500).then(() => {
        prayCardCarouselApi.scrollNext();
      });
    }

    if (targetFriend) {
      KakaoController.sendMessageForFriends(kakaoMessage, [targetFriend.uuid]);
    }
    analyticsTrack("클릭_기도카드_반응", {
      pray_type: prayType,
      where: eventOption.where,
    });
  };

  return (
    <div className="flex justify-center gap-[30px]">
      {Object.values(PrayType).map((type) => {
        const emojiData = PrayTypeDatas[type];

        return (
          <button
            key={type}
            onClick={handleClick(type as PrayType)}
            className={`flex justify-center items-center w-[65px] h-[65px] rounded-full ${
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
