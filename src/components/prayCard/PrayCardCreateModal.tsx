import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import useBaseStore from "@/stores/baseStore";

interface PrayCardCreateModalProps {
  currentUserId: string | undefined;
  groupId: string | undefined;
}

const PrayCardCreateModal: React.FC<PrayCardCreateModalProps> = ({
  currentUserId,
  groupId,
}) => {
  const memberList = useBaseStore((state) => state.memberList);
  const inputPrayCardContent = useBaseStore(
    (state) => state.inputPrayCardContent
  );
  const setPrayCardContent = useBaseStore((state) => state.setPrayCardContent);
  const createMember = useBaseStore((state) => state.createMember);
  const createPrayCard = useBaseStore((state) => state.createPrayCard);

  const handleCreatePrayCard = async (
    currentUserId: string | undefined,
    groupId: string | undefined
  ) => {
    const isMember = memberList?.some(
      (member) => member.user_id === currentUserId
    );
    if (!isMember) {
      await createMember(groupId, currentUserId);
    }
    await createPrayCard(groupId, currentUserId, inputPrayCardContent);
    window.location.reload();
  };

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
          disabled={!inputPrayCardContent}
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
