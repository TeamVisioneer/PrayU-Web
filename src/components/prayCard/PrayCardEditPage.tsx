import useBaseStore from "@/stores/baseStore";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/use-toast";
import { ChevronLeft } from "lucide-react";

const PrayCardEditPage = () => {
  const { groupId, praycardId } = useParams<{
    groupId: string;
    praycardId: string;
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const inputPrayCardContent = useBaseStore(
    (state) => state.inputPrayCardContent
  );
  const setPrayCardContent = useBaseStore((state) => state.setPrayCardContent);
  const updateMember = useBaseStore((state) => state.updateMember);
  const getMember = useBaseStore((state) => state.getMember);
  const user = useBaseStore((state) => state.user);
  const updatePrayCardContent = useBaseStore(
    (state) => state.updatePrayCardContent
  );

  const handleSave = async () => {
    if (groupId && praycardId && user) {
      const member = await getMember(user.id, groupId);
      await updateMember(member?.id as string, inputPrayCardContent.trim());
      await updatePrayCardContent(praycardId, inputPrayCardContent.trim());
      setPrayCardContent(inputPrayCardContent.trim());
      toast({
        description: "✏️ 기도카드가 수정되었습니다.",
      });
      navigate(-1);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <header className="flex items-center p-4 border-b relative">
        <button onClick={() => navigate(-1)} className="absolute left-4">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold w-full text-center">기도카드 수정</h1>
      </header>

      <main className="flex-1 p-4">
        <Textarea
          className="w-full h-full p-4 border-none resize-none focus:ring-0"
          value={inputPrayCardContent}
          onChange={(e) => setPrayCardContent(e.target.value)}
          placeholder={`기도카드를 작성해 보아요 ✏️\n내용은 작성 후에도 수정할 수 있어요 :)\n\n1. PrayU와 함께 기도할 수 있기를\n2. `}
          autoFocus
        />
      </main>

      <footer className="grid grid-cols-2 gap-4 p-4 border-t">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="w-full"
        >
          취소
        </Button>
        <Button
          variant="primary"
          onClick={() => handleSave()}
          className="w-full"
        >
          저장
        </Button>
      </footer>
    </div>
  );
};

export default PrayCardEditPage;
