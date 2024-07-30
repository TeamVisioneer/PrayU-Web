import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import useBaseStore from "@/stores/baseStore";
import { MemberWithProfiles } from "supabase/types/tables";
import { useEffect } from "react";

interface PrayCardCreateModalProps {
  currentUserId: string | undefined;
  groupId: string | undefined;
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

  const handleCreatePrayCard = async (
    currentUserId: string | undefined,
    groupId: string | undefined
  ) => {
    setIsDisabledPrayCardCreateBtn(true);
    if (!member) {
      const newMember = await createMember(groupId, currentUserId);
      await updateMember(newMember?.id, inputPrayCardContent);
    } else {
      await updateMember(member.id, inputPrayCardContent);
    }
    await createPrayCard(groupId, currentUserId, inputPrayCardContent);
    window.location.reload();
  };

  useEffect(() => {
    setPrayCardContent(member?.pray_summary || "");
  }, [member, setPrayCardContent]);

  return (
    <div className="flex flex-col items-center min-h-screen gap-4">
      <div className="w-full flex flex-col"></div>
      <Textarea
        className="h-80 placeholder-gray-50 p-5"
        style={{
          fontSize: "16px",
        }}
        placeholder="기도제목을 작성해주세요"
        value={inputPrayCardContent}
        onChange={(e) => setPrayCardContent(e.target.value)}
      />

      <div className="w-full flex flex-col items-center justify-center text-center">
        <Button
          className="w-full bg-black hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => handleCreatePrayCard(currentUserId, groupId)}
          disabled={isDisabledPrayCardCreateBtn}
        >
          그룹 참여하기
        </Button>
      </div>
      <div className="text-sm text-gray-500">
        기도제목을 작성하면 그룹에 참여할 수 있어요
      </div>
    </div>
  );
};

export default PrayCardCreateModal;
