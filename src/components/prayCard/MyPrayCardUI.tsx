import useBaseStore from "@/stores/baseStore";
import { useEffect, useState, useRef } from "react";
import { PrayCardWithProfiles } from "supabase/types/tables";
import { MemberWithProfiles } from "supabase/types/tables";
import { ClipLoader } from "react-spinners";
import { Drawer, DrawerTrigger } from "../ui/drawer";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import PrayList from "../pray/PrayList";
import { getDateDistance } from "@toss/date";
import { getISOOnlyDate, getISOTodayDate } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { FaEdit, FaSave } from "react-icons/fa";
import iconUserMono from "@/assets/icon-user-mono.svg";

interface PrayCardProps {
  prayCard: PrayCardWithProfiles;
  member?: MemberWithProfiles | null;
}

const MyPrayCardUI: React.FC<PrayCardProps> = ({ member, prayCard }) => {
  const prayDataHash = useBaseStore((state) => state.prayDataHash);
  const reactionCounts = useBaseStore((state) => state.reactionCounts);
  const inputPrayCardContent = useBaseStore(
    (state) => state.inputPrayCardContent
  );
  const isEditingPrayCard = useBaseStore((state) => state.isEditingPrayCard);

  const setPrayCardContent = useBaseStore((state) => state.setPrayCardContent);
  const setIsEditingPrayCard = useBaseStore(
    (state) => state.setIsEditingPrayCard
  );
  const updateMember = useBaseStore((state) => state.updateMember);
  const updatePrayCardContent = useBaseStore(
    (state) => state.updatePrayCardContent
  );
  const setReactionDatasForMe = useBaseStore(
    (state) => state.setReactionDatasForMe
  );

  const [isScrollable, setIsScrollable] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const prayDatas = prayCard.pray;

  const dateDistance = getDateDistance(
    new Date(
      getISOOnlyDate(
        prayCard?.created_at ?? member?.updated_at ?? getISOTodayDate()
      )
    ),
    new Date(getISOTodayDate())
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
    const textarea = textareaRef.current;
    if (prayDatas) {
      setReactionDatasForMe(prayDatas);
    }
    if (textarea) {
      setIsScrollable(textarea.scrollHeight > textarea.clientHeight);
    }
  }, [inputPrayCardContent, prayDatas, setReactionDatasForMe]);

  if (!prayDataHash) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  const MyPrayCardBody = (
    <div className="relative flex flex-col h-50vh min-h-[300px] bg-white rounded-2xl shadow-md">
      <div className="bg-gradient-to-r from-start/60 via-middle/60 h-15vh via-30% to-end/60 flex flex-col justify-center items-start gap-1 rounded-t-2xl p-5">
        <div className="flex items-center gap-2 w-full">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-white">
              기도 {dateDistance.days + 1}일차
            </p>
          </div>
        </div>
        <p className="text-xs text-white w-full text-left">
          시작일 :{" "}
          {prayCard?.created_at.split("T")[0] ||
            member?.updated_at.split("T")[0]}
        </p>
      </div>
      <div
        className={`p-2 flex justify-center h-full overflow-y-auto no-scrollbar ${
          isScrollable ? "items-start" : "items-center"
        }`}
      >
        {isEditingPrayCard ? (
          <Textarea
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
      <div className="absolute bottom-4 right-4">
        {isEditingPrayCard ? (
          <button
            className={`text-white rounded-full bg-middle/90 w-10 h-10 flex justify-center items-center ${
              !inputPrayCardContent ? " opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() =>
              handleSaveClick(prayCard!.id, inputPrayCardContent, member?.id)
            }
            disabled={!inputPrayCardContent}
          >
            <FaSave className="text-white w-5 h-5" />
          </button>
        ) : (
          <button
            className="text-white rounded-full bg-end/90 w-10 h-10 flex justify-center items-center"
            onClick={() => setIsEditingPrayCard(true)}
          >
            <FaEdit className="text-white w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {MyPrayCardBody}
      <div className="flex flex-col gap-5">
        <Drawer>
          <DrawerTrigger className="w-full focus:outline-none">
            <div className="flex justify-center gap-2">
              {Object.values(PrayType).map((type) => {
                if (!reactionCounts) return null;
                return (
                  <div
                    key={type}
                    className={`w-[60px] py-1 px-2 flex rounded-lg bg-white text-black gap-2
                      }`}
                  >
                    <div className="text-sm w-5 h-5">
                      <img
                        src={PrayTypeDatas[type].img}
                        alt={PrayTypeDatas[type].emoji}
                        className="w-5 h-5"
                      />
                    </div>
                    <div className="text-sm">{reactionCounts[type]}</div>
                  </div>
                );
              })}
              <div className="bg-white rounded-lg flex justify-center items-center p-1">
                <img className="w-5" src={iconUserMono} alt="user-icon" />
              </div>
            </div>
          </DrawerTrigger>
          <PrayList />
        </Drawer>
      </div>
    </div>
  );
};

export default MyPrayCardUI;
