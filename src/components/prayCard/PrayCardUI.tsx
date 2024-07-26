import useBaseStore from "@/stores/baseStore";
import { useEffect, useState, useRef } from "react";
import { PrayCardWithProfiles } from "supabase/types/tables";
import { MemberWithProfiles } from "supabase/types/tables";
import { ClipLoader } from "react-spinners";
import { Drawer, DrawerTrigger } from "../ui/drawer";
import { PrayType } from "@/Enums/prayType";
import PrayList from "../pray/PrayList";
import ReactionWithCalendar from "./ReactionWithCalendar";
import { getDateDistance } from "@toss/date";
import { getISOOnlyDate, getISOTodayDate } from "@/lib/utils";

interface PrayCardProps {
  currentUserId: string;
  prayCard: PrayCardWithProfiles | null;
  member?: MemberWithProfiles | undefined;
}

const PrayCardUI: React.FC<PrayCardProps> = ({
  currentUserId,
  member,
  prayCard,
}) => {
  const prayDataHash = useBaseStore((state) => state.prayDataHash);
  const reactionDatas = useBaseStore((state) => state.reactionDatas);
  const setPrayCardContent = useBaseStore((state) => state.setPrayCardContent);
  const inputPrayCardContent = useBaseStore(
    (state) => state.inputPrayCardContent
  );
  const isEditingPrayCard = useBaseStore((state) => state.isEditingPrayCard);
  const setIsEditingPrayCard = useBaseStore(
    (state) => state.setIsEditingPrayCard
  );
  const updateMember = useBaseStore((state) => state.updateMember);
  const updatePrayCardContent = useBaseStore(
    (state) => state.updatePrayCardContent
  );
  const fetchPrayDataByUserId = useBaseStore(
    (state) => state.fetchPrayDataByUserId
  );

  const [isScrollable, setIsScrollable] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const dateDistance = getDateDistance(
    new Date(getISOTodayDate()),
    new Date(getISOOnlyDate(prayCard?.created_at ?? getISOTodayDate()))
  );

  const handleSaveClick = (
    prayCardId: string,
    content: string,
    memberId: string | undefined
  ) => {
    updatePrayCardContent(prayCardId, content);
    updateMember(memberId, content);
  };

  useEffect(() => {
    fetchPrayDataByUserId(
      prayCard?.id,
      prayCard?.user_id == currentUserId ? undefined : currentUserId
    );
  }, [currentUserId, fetchPrayDataByUserId, prayCard?.id, prayCard?.user_id]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      setIsScrollable(textarea.scrollHeight > textarea.clientHeight);
    }
  }, [inputPrayCardContent]);

  if (!prayDataHash) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  const PrayCardBody = (
    <div className="flex flex-col h-50vh min-h-[300px] p-5 bg-blue-50 rounded-2xl">
      <div className="flex items-center gap-2">
        <img
          src={
            prayCard?.profiles.avatar_url || member?.profiles.avatar_url || ""
          }
          className="w-5 h-5 rounded-full"
        />
        <div className="text-sm">
          {prayCard?.profiles.full_name || member?.profiles.full_name}
        </div>
        {currentUserId == prayCard?.user_id && (
          <div className="flex gap-2">
            <p className="text-sm text-gray-500">
              {dateDistance.days + 1}일 차
            </p>
          </div>
        )}
      </div>
      <div
        className={`flex justify-center h-full overflow-y-auto no-scrollbar ${
          isScrollable ? "items-start" : "items-center"
        }`}
      >
        {prayCard?.user_id !== currentUserId ? (
          <p className="whitespace-pre-line">
            {prayCard?.content || member?.pray_summary}
          </p>
        ) : isEditingPrayCard ? (
          <textarea
            ref={textareaRef}
            className="w-full h-full p-2 rounded-md border border-gray-300 resize-none overflow-auto"
            value={inputPrayCardContent}
            onChange={(e) => setPrayCardContent(e.target.value)}
            maxLength={400}
          />
        ) : (
          <p className="whitespace-pre-line">{inputPrayCardContent}</p>
        )}
      </div>
      <p className="text-sm text-gray-500">
        created at:{prayCard?.created_at.split("T")[0]}
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {PrayCardBody}
      {currentUserId != prayCard?.user_id ? (
        <ReactionWithCalendar prayCard={prayCard} />
      ) : (
        <div className="flex flex-col gap-5">
          {isEditingPrayCard ? (
            <button
              className={`w-full bg-green-700 text-white rounded-2xl ${
                !inputPrayCardContent ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() =>
                handleSaveClick(prayCard!.id, inputPrayCardContent, member?.id)
              }
              disabled={!inputPrayCardContent}
            >
              저장
            </button>
          ) : (
            <button
              className="w-full bg-black text-white rounded-2xl"
              onClick={() => setIsEditingPrayCard(true)}
            >
              수정
            </button>
          )}
          <Drawer>
            <DrawerTrigger className="w-full focus:outline-none">
              <div className="flex justify-center space-x-8">
                {Object.values(PrayType).map((type) => {
                  const emojiData = reactionDatas[type];
                  if (!emojiData) return null;
                  return (
                    <div
                      key={type}
                      className={`w-[90px] py-2 px-2 flex flex-col items-center rounded-2xl bg-purple-100 text-black
                      }`}
                    >
                      <div className="text-2xl">{emojiData.emoji}</div>
                      <div className="text-sm">{emojiData.num}</div>
                    </div>
                  );
                })}
              </div>
            </DrawerTrigger>
            <PrayList />
          </Drawer>
        </div>
      )}
    </div>
  );
};

export default PrayCardUI;
