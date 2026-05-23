import useBaseStore from "@/stores/baseStore";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { useToast } from "../../components/ui/use-toast";
import { IoChevronBack } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";
import InfoBtn from "../../components/alert/infoBtn";
import { Reorder } from "framer-motion";
import PrayRequestItem from "../../components/prayCard/PrayRequestItem";
import PrayCard from "../../components/prayCard/PrayCard";
import { PrayCardWithProfiles } from "supabase/types/tables";
import { getISOTodayDate } from "@/lib/utils";

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
  const myMember = useBaseStore((state) => state.myMember);
  const user = useBaseStore((state) => state.user);
  const updatePrayCard = useBaseStore((state) => state.updatePrayCard);

  const [previewMode, setPreviewMode] = useState(false);
  const [showAddPrayForm, setShowAddPrayForm] = useState(false);
  const [currentPrayInput, setCurrentPrayInput] = useState("");
  const [editingPrayIndex, setEditingPrayIndex] = useState<number | null>(null);
  const [prayRequests, setPrayRequests] = useState<string[]>(
    inputPrayCardContent
      .split("\n\n")
      .filter((request) => request.trim() !== "")
  );

  const lifeShareRef = useRef<HTMLTextAreaElement>(null);
  const prayRequestRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (lifeShareRef.current) {
      lifeShareRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (showAddPrayForm && prayRequestRef.current) {
      prayRequestRef.current.focus();
    }
  }, [showAddPrayForm]);

  // Generate preview prayCard object based on current input
  // Using as PrayCardWithProfiles for preview only
  const previewPrayCard = {
    id: praycardId || "preview",
    user_id: user?.id,
    group_id: groupId || "preview",
    content: inputPrayCardContent,
    life: inputPrayCardLife,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    bible_card_id: null,
    bible_card_url: null,
    profiles: myMember?.profiles,
    pray: [],
  } as PrayCardWithProfiles; // Type assertion for preview purposes

  const handleSave = async () => {
    if (groupId && praycardId && user) {
      const member = await getMember(user.id, groupId);
      await updateMember(
        member?.id as string,
        inputPrayCardContent.trim(),
        getISOTodayDate()
      );
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

  const handleAddPrayRequest = () => {
    if (currentPrayInput.trim()) {
      let newRequests = [...prayRequests];

      if (editingPrayIndex !== null) {
        // Edit existing
        newRequests[editingPrayIndex] = currentPrayInput.trim();
      } else {
        // Add new
        newRequests = [...prayRequests, currentPrayInput.trim()];
      }

      setPrayRequests(newRequests);
      setCurrentPrayInput("");
      setShowAddPrayForm(false);
      setEditingPrayIndex(null);
      setPrayCardContent(newRequests.join("\n\n"));
    }
  };

  const handleEditPrayRequest = (index: number) => {
    setCurrentPrayInput(prayRequests[index]);
    setEditingPrayIndex(index);
    setShowAddPrayForm(true);
  };

  const handleDeletePrayRequest = (index: number) => {
    const newRequests = prayRequests.filter((_, i) => i !== index);
    setPrayRequests(newRequests);
    setPrayCardContent(newRequests.join("\n\n"));
  };

  return (
    <div className="bg-white flex flex-col w-full h-full overflow-y-auto no-scrollbar">
      <header className="sticky top-0 z-50 flex items-center p-4 border-b bg-white">
        <button onClick={() => navigate(-1)} className="absolute left-4">
          <IoChevronBack size={20} />
        </button>
        <h1 className="text-lg font-bold w-full text-center">기도카드 수정</h1>
        <button
          className="absolute right-4 text-sm font-medium text-blue-500"
          onClick={() => setPreviewMode(!previewMode)}
        >
          {previewMode ? "수정하기" : "미리보기"}
        </button>
      </header>

      {previewMode ? (
        // Preview mode using PrayCard component
        <main className="flex-1 p-4 flex flex-col">
          <div className="w-full max-w-md mx-auto">
            <PrayCard
              prayCard={previewPrayCard}
              isMoreBtn={false}
              editable={false}
            />
          </div>
        </main>
      ) : (
        // Edit mode
        <main className="flex-1 p-4 flex flex-col gap-6">
          {/* Life Share Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <h2 className="text-lg font-bold">일상 나눔</h2>
              <InfoBtn
                text={[
                  "기도카드에 <일상 나눔> 항목이 추가되었어요!",
                  "기도제목보다 가벼운 일상을 나눠보세요 🙂",
                ]}
                eventOption={{ where: "PrayCardEditPage" }}
                position="start"
              />
            </div>

            <div className="relative">
              <Textarea
                className="w-full min-h-28 p-4 rounded-xl placeholder:text-gray-400 border-gray-200 focus:border-blue-300 focus:ring-blue-200 bg-gray-50/50 resize-none"
                ref={lifeShareRef}
                value={inputPrayCardLife}
                onChange={(e) => {
                  setPrayCardLife(e.target.value);
                }}
                placeholder="삶 가운데 있었던 일들을 나눠보세요"
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              <div className="text-xs text-gray-500">
                <span className="text-blue-500 font-medium">Tip</span> 길게 쓸
                필요 없어요. 간단하게 나눠보세요!
              </div>
              <div className="text-xs text-gray-400">
                {inputPrayCardLife.length}
              </div>
            </div>
          </div>

          {/* Prayer Requests Section */}
          <div className="flex flex-col gap-2 flex-grow">
            <h2 className="text-lg font-bold">기도제목</h2>

            {showAddPrayForm ? (
              // Inline Add/Edit Prayer Form
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-4">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-base font-medium text-gray-800">
                    {editingPrayIndex !== null
                      ? "기도제목 수정"
                      : "새 기도제목"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowAddPrayForm(false);
                        setEditingPrayIndex(null);
                        setCurrentPrayInput("");
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleAddPrayRequest}
                      disabled={!currentPrayInput.trim()}
                      className={`text-sm font-medium px-3 py-1 rounded ${
                        currentPrayInput.trim()
                          ? "bg-blue-100 text-blue-500 hover:bg-blue-200"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {editingPrayIndex !== null ? "저장" : "추가"}
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <Textarea
                    ref={prayRequestRef}
                    placeholder="기도제목을 입력하세요"
                    className="w-full min-h-[150px] resize-none p-4 rounded-xl placeholder:text-gray-400 border-gray-200 focus:border-blue-300 focus:ring-blue-200 bg-gray-50/50"
                    value={currentPrayInput}
                    onChange={(e) => {
                      setCurrentPrayInput(e.target.value);
                    }}
                  />
                  <div className="flex justify-end mt-2">
                    <div className="text-xs text-gray-400">
                      {currentPrayInput.length}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => {
                  setEditingPrayIndex(null);
                  setCurrentPrayInput("");
                  setShowAddPrayForm(true);
                }}
                className="w-full bg-white hover:bg-gray-50 text-gray-500 mb-4 flex justify-start items-center border border-gray-200 shadow-sm p-3 h-auto rounded-lg"
              >
                <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <span className="text-gray-400">새 기도제목 추가하기</span>
              </Button>
            )}

            {!showAddPrayForm && (
              <div className="text-xs text-gray-500 mb-4">
                <span className="text-blue-500 font-medium">Tip</span>{" "}
                기도제목을 클릭하면 수정할 수 있어요. 드래그하여 순서를 변경할
                수도 있어요!
              </div>
            )}

            <div className="h-80 overflow-y-auto">
              {prayRequests.length > 0 ? (
                <Reorder.Group
                  axis="y"
                  values={prayRequests}
                  onReorder={(newRequests) => {
                    setPrayRequests(newRequests);
                    setPrayCardContent(newRequests.join("\n\n"));
                  }}
                  className="space-y-2"
                >
                  {prayRequests.map((request, index) => (
                    <PrayRequestItem
                      key={request}
                      request={request}
                      index={index}
                      onEdit={handleEditPrayRequest}
                      onDelete={handleDeletePrayRequest}
                    />
                  ))}
                </Reorder.Group>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>기도제목을 추가해주세요</p>
                  <p className="text-xs mt-1">
                    상단의 버튼을 클릭하여 추가할 수 있어요
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

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
