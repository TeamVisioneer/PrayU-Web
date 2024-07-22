import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";
import { PrayCardWithProfiles } from "supabase/types/tables";
import PrayCardCalendar from "./WeeklyCalendar";
import ReactionBtn from "./ReactionBtn";
import { ClipLoader } from "react-spinners";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { PrayType } from "@/Enums/prayType";

interface PrayCardProps {
  currentUserId: string | undefined;
  prayCard: PrayCardWithProfiles | undefined;
}

const PrayCardUI: React.FC<PrayCardProps> = ({ currentUserId, prayCard }) => {
  const prayDataHash = useBaseStore((state) => state.prayDataHash);
  const reactionDatas = useBaseStore((state) => state.reactionDatas);

  const fetchPrayDataByUserId = useBaseStore(
    (state) => state.fetchPrayDataByUserId
  );

  useEffect(() => {
    if (prayCard?.user_id == currentUserId)
      fetchPrayDataByUserId(prayCard?.id, undefined);
    else fetchPrayDataByUserId(prayCard?.id, currentUserId);
  }, [fetchPrayDataByUserId, prayCard?.id, currentUserId, prayCard?.user_id]);

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
        />
        <div className="text-sm">{prayCard?.profiles.full_name}</div>
      </div>
      <div className="flex h-full justify-center items-center">
        {prayCard?.content}
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
        <div>
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
            <DrawerContent className="h-[400px]">
              <DrawerHeader>
                <DrawerTitle>기도해준 사람</DrawerTitle>
              </DrawerHeader>
              <DrawerDescription></DrawerDescription>
            </DrawerContent>
          </Drawer>
        </div>
      )}
    </div>
  );
};

export default PrayCardUI;
