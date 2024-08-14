import { useNavigate } from "react-router-dom";
import { analyticsTrack } from "@/analytics/analytics";
import { Textarea } from "@/components/ui/textarea";
import useAuth from "@/hooks/useAuth";
import { getISOTodayDate } from "@/lib/utils";
import useBaseStore from "@/stores/baseStore";
import { Member } from "supabase/types/tables";
import prayerVerses from "@/data/prayCardTemplate.json";
import { Button } from "@/components/ui/button";

const PrayCardCreatePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const targetGroup = useBaseStore((state) => state.targetGroup);
  const inputPrayCardContent = useBaseStore(
    (state) => state.inputPrayCardContent
  );
  const setPrayCardContent = useBaseStore((state) => state.setPrayCardContent);
  const isDisabledPrayCardCreateBtn = useBaseStore(
    (state) => state.isDisabledPrayCardCreateBtn
  );
  const setIsDisabledPrayCardCreateBtn = useBaseStore(
    (state) => state.setIsDisabledGroupCreateBtn
  );
  const getMember = useBaseStore((state) => state.getMember);
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
    const member = await getMember(currentUserId, groupId);
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
    navigate("/group/" + groupId, { replace: true });
  };

  if (targetGroup == null) {
    return (
      <div className="h-screen flex flex-col justify-center items-center gap-2">
        <div>그룹을 찾을 수 없어요😂</div>
        <a href="/" className="text-sm underline text-gray-400">
          PrayU 홈으로
        </a>
      </div>
    );
  }

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
        onClick={() => handleCreatePrayCard(user!.id, targetGroup.id)}
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

export default PrayCardCreatePage;
