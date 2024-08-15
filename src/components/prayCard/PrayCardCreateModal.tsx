import { Button } from "../ui/button";
import useBaseStore from "@/stores/baseStore";
import { Member, MemberWithProfiles } from "supabase/types/tables";
import { useEffect } from "react";
import { analyticsTrack } from "@/analytics/analytics";
import { getISOTodayDate, getISOTodayDateYMD } from "@/lib/utils";
import prayerVerses from "@/data/prayCardTemplate.json";

interface PrayCardCreateModalProps {
  currentUserId: string;
  groupId: string;
  member: MemberWithProfiles | null;
}

const PrayCardCreateModal: React.FC<PrayCardCreateModalProps> = ({
  currentUserId,
  groupId,
  member,
}) => {
  const user = useBaseStore((state) => state.user);
  const inputPrayCardContent = useBaseStore(
    (state) => state.inputPrayCardContent
  );
  const isDisabledPrayCardCreateBtn = useBaseStore(
    (state) => state.isDisabledPrayCardCreateBtn
  );
  const setIsDisabledPrayCardCreateBtn = useBaseStore(
    (state) => state.setIsDisabledPrayCardCreateBtn
  );
  const setPrayCardContent = useBaseStore((state) => state.setPrayCardContent);
  const createMember = useBaseStore((state) => state.createMember);
  const updateMember = useBaseStore((state) => state.updateMember);
  const createPrayCard = useBaseStore((state) => state.createPrayCard);

  const todayDateYMD = getISOTodayDateYMD();

  const getRandomVerse = () => {
    const randomIndex = Math.floor(Math.random() * prayerVerses.length);
    return `(${prayerVerses[randomIndex].verse})\n${prayerVerses[randomIndex].text}`;
  };

  const onClickPrayCardTemplate = () => {
    analyticsTrack("클릭_기도카드_템플릿", {});
    setPrayCardContent(getRandomVerse());
  };

  const handleCreatePrayCard = async (
    currentUserId: string,
    groupId: string
  ) => {
    setIsDisabledPrayCardCreateBtn(true);
    analyticsTrack("클릭_기도카드_생성", { group_id: groupId });
    let updatedMember: Member | null;
    if (!member) {
      updatedMember = await createMember(
        groupId,
        currentUserId,
        inputPrayCardContent
      );
    } else {
      updatedMember = await updateMember(
        member.id,
        inputPrayCardContent,
        getISOTodayDate()
      );
    }
    if (!updatedMember) {
      setIsDisabledPrayCardCreateBtn(false);
      return;
    }
    const newPrayCard = await createPrayCard(
      groupId,
      currentUserId,
      inputPrayCardContent
    );
    if (!newPrayCard) {
      setIsDisabledPrayCardCreateBtn(false);
      return;
    }
    window.location.reload();
  };

  useEffect(() => {
    setPrayCardContent(member?.pray_summary || "");
  }, [member, setPrayCardContent]);

  const PrayCardUI = () => (
    <div className="flex flex-col gap-6 min-h-[50vh] max-h-[50vh] justify-center">
      <div className="flex flex-col flex-grow min-h-full max-h-full bg-white rounded-2xl shadow-prayCard">
        <div className="flex flex-col justify-center items-start gap-1 bg-gradient-to-r from-start/60 via-middle/60 via-30% to-end/60 rounded-t-2xl p-5">
          <div className="flex items-center gap-2">
            <img
              src={user?.user_metadata.avatar_url || ""}
              className="w-7 h-7 rounded-full object-cover"
            />
            <p className="text-white text-lg ">
              {user?.user_metadata.full_name}
            </p>
          </div>
          <p className="text-sm text-white w-full text-left">
            시작일 :{todayDateYMD.year}.{todayDateYMD.month}.{todayDateYMD.day}
          </p>
        </div>
        <div className="flex flex-col flex-grow min-h-full max-h-full px-[10px] py-[10px] overflow-y-auto no-scrollbar items-center">
          <textarea
            className="text-sm flex-grow w-full p-2 rounded-md overflow-y-auto no-scrollbar text-gray-700 !opacity-100 !border-none !cursor-default focus:outline-none focus:border-none"
            value={inputPrayCardContent}
            onChange={(e) => setPrayCardContent(e.target.value)}
            placeholder={`기도제목은  수정할 수 있어요 :)\n\n1. PrayU와 함께 기도할 수 있기를\n2. `}
          />
          {!inputPrayCardContent && (
            <p
              className="text-xs text-gray-500 underline"
              onClick={() => onClickPrayCardTemplate()}
            >
              기도카드 템플릿 사용하기
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center min-h-screen gap-3">
      <div className="flex flex-col items-center gap-2 p-2">
        <p className="text-xl font-bold break-normal text-center">
          {/* TODO: 줄바꿈 처리 */}
          당신의 기도제목을 알려주세요 😁
        </p>
      </div>
      <div className="w-full px-5">{PrayCardUI()}</div>

      <div className="flex flex-col w-full p-5 gap-2">
        <Button
          className="w-full"
          onClick={() => handleCreatePrayCard(currentUserId, groupId)}
          disabled={isDisabledPrayCardCreateBtn}
          variant="primary"
        >
          그룹 참여하기
        </Button>
        {/* <p className="text-center text-sm text-gray-500">
          기도제목을 작성하면 그룹에 참여할 수 있어요
        </p> */}
      </div>
    </div>
  );
};

export default PrayCardCreateModal;
