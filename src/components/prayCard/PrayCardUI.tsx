import useBaseStore from "@/stores/baseStore";
import { useEffect, useState } from "react";
import { PrayCardWithProfiles } from "supabase/types/tables";
import PrayCardCalendar from "./WeeklyCalendar";
import ReactionBtn from "./ReactionBtn";
import { ClipLoader } from "react-spinners";
import { Drawer, DrawerTrigger } from "../ui/drawer";
import { PrayType } from "@/Enums/prayType";
import PrayList from "../pray/PrayList";

interface PrayCardProps {
  currentUserId: string | undefined;
  prayCard: PrayCardWithProfiles | undefined;
}

const PrayCardUI: React.FC<PrayCardProps> = ({ currentUserId, prayCard }) => {
  const prayDataHash = useBaseStore((state) => state.prayDataHash);
  const reactionDatas = useBaseStore((state) => state.reactionDatas);
  const isEditingPrayCard = useBaseStore((state) => state.isEditingPrayCard);
  const setMyPrayerContent = useBaseStore((state) => state.setMyPrayerContent);
  const handleEditClick = useBaseStore((state) => state.handleEditClick);
  const handleSaveClick = useBaseStore((state) => state.handleSaveClick);

  const fetchPrayDataByUserId = useBaseStore(
    (state) => state.fetchPrayDataByUserId
  );

  const myPrayerContent = useBaseStore((state) => state.myPrayerContent);
  const [content, setContent] = useState(myPrayerContent || "");

  useEffect(() => {
    fetchPrayDataByUserId(
      prayCard?.id,
      prayCard?.user_id == currentUserId ? undefined : currentUserId
    );
  }, [
    fetchPrayDataByUserId,
    prayCard?.id,
    currentUserId,
    prayCard?.user_id,
    setMyPrayerContent,
    prayCard?.content,
  ]);

  if (!prayDataHash[prayCard?.id || ""]) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  const PrayCardBody = (
    <div className="flex flex-col h-50vh p-5 bg-blue-50 rounded-2xl">
      <div className="flex items-center gap-2">
        <img
          src={prayCard?.profiles.avatar_url || ""}
          className="w-5 h-5 rounded-full"
          alt={`${prayCard?.profiles.full_name} avatar`}
        />
        <div className="text-sm">{prayCard?.profiles.full_name}</div>
      </div>
      <div className="flex h-full justify-center items-center">
        {isEditingPrayCard ? (
          <textarea
            className="w-full h-full p-2 rounded-md border border-gray-300"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        ) : (
          <p>{content}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {PrayCardBody}
      {currentUserId != prayCard?.user_id ? (
        <div className="flex flex-col gap-6">
          <PrayCardCalendar
            prayCard={prayCard}
            prayData={prayDataHash[prayCard?.id || ""] || []}
          />
          <ReactionBtn currentUserId={currentUserId} prayCard={prayCard} />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {isEditingPrayCard ? (
            <button
              className="w-full bg-green-700 text-white rounded-2xl"
              onClick={() => handleSaveClick(prayCard!.id, content)}
            >
              저장
            </button>
          ) : (
            <button
              className="w-full bg-black text-white rounded-2xl"
              onClick={handleEditClick}
            >
              수정
            </button>
          )}
          <Drawer>
            <DrawerTrigger className="w-full">
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
