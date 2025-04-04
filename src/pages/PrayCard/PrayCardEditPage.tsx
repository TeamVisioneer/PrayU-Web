import useBaseStore from "@/stores/baseStore";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { useToast } from "../../components/ui/use-toast";
import { IoChevronBack } from "react-icons/io5";
import { useEffect, useRef } from "react";
import InfoBtn from "../../components/alert/infoBtn";

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
  const inputPrayCardLife = useBaseStore((state) => state.inputPrayCardLife);
  const setPrayCardContent = useBaseStore((state) => state.setPrayCardContent);
  const setPrayCardLife = useBaseStore((state) => state.setPrayCardLife);
  const updateMember = useBaseStore((state) => state.updateMember);
  const getMember = useBaseStore((state) => state.getMember);
  const user = useBaseStore((state) => state.user);
  const updatePrayCard = useBaseStore((state) => state.updatePrayCard);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, []);

  const handleSave = async () => {
    if (groupId && praycardId && user) {
      const member = await getMember(user.id, groupId);
      await updateMember(member?.id as string, inputPrayCardContent.trim());
      await updatePrayCard(praycardId, {
        life: inputPrayCardLife.trim(),
        content: inputPrayCardContent.trim(),
      });
      toast({
        description: "✏️ 기도카드가 수정되었습니다.",
      });
      navigate(-1);
    }
  };

  return (
    <div className=" bg-white flex flex-col w-full h-full overflow-y-auto no-scrollbar">
      <header className="sticky top-0 z-50 flex items-center p-4 border-b bg-white">
        <button onClick={() => navigate(-1)} className="absolute left-4">
          <IoChevronBack size={20} />
        </button>
        <h1 className="text-lg font-bold w-full text-center">기도카드 수정</h1>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <h2 className="font-semibold">일상 나눔</h2>
            <InfoBtn
              text={[
                "기도카드에 <일상 나눔> 항목이 추가되었어요!",
                "기도제목보다 가벼운 일상을 나눠보세요 🙂",
              ]}
              eventOption={{ where: "PrayCardEditPage" }}
              position="start"
            />
          </div>
          <Textarea
            className="w-full min-h-40 p-4 border resize-none focus:ring-0"
            ref={textareaRef}
            value={inputPrayCardLife}
            onChange={(e) => setPrayCardLife(e.target.value)}
            placeholder="삶 가운데 있었던 일들을 나눠보세요"
          />
        </div>
        <div className="flex flex-col gap-2 flex-grow">
          <h2 className="font-semibold">기도제목</h2>
          <Textarea
            className="w-full min-h-40 h-full p-4 border resize-none focus:ring-0"
            value={inputPrayCardContent}
            onChange={(e) => setPrayCardContent(e.target.value)}
            placeholder="이번 주 기도제목을 작성해 보세요"
          />
        </div>
      </main>

      <footer className="sticky bottom-0 bg-white z-50 grid grid-cols-2 gap-4 p-4 border-t">
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
