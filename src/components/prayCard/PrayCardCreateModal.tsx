import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import useBaseStore from "@/stores/baseStore";
import { Member, MemberWithProfiles } from "supabase/types/tables";
import { useEffect } from "react";
import { analyticsTrack } from "@/analytics/analytics";
import { getISOTodayDate } from "@/lib/utils";
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

  return (
    <div className="flex flex-col items-center min-h-screen gap-3">
      <div className="flex flex-col items-center gap-2 p-2">
        <p className="text-xl font-bold">이번 주 기도제목을 알려주세요 😁</p>
        <p
          className="text-sm text-gray-500 underline"
          onClick={() => onClickPrayCardTemplate()}
        >
          기도카드 템플릿 사용하기
        </p>
      </div>

      <Textarea
        className="h-80 p-5 text-[16px]"
        placeholder="일주일 간 그룹원들이 볼 수 있어요! :)"
        value={inputPrayCardContent}
        onChange={(e) => setPrayCardContent(e.target.value)}
      />

      <Button
        className="w-full"
        onClick={() => handleCreatePrayCard(currentUserId, groupId)}
        disabled={isDisabledPrayCardCreateBtn}
        variant="primary"
      >
        그룹 참여하기
      </Button>
      <div className="text-sm text-gray-500">
        기도제목을 작성하면 그룹에 참여할 수 있어요
      </div>
    </div>
  );
};

export default PrayCardCreateModal;
