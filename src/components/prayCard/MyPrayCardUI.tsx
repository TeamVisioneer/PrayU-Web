import { useState, useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import { MemberWithProfiles } from "supabase/types/tables";
import { Drawer, DrawerTrigger } from "../ui/drawer";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import PrayList from "../pray/PrayList";
import { getDateDistance } from "@toss/date";
import { getISOOnlyDate, getISOTodayDate } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { FaEdit, FaSave } from "react-icons/fa";
import iconUserMono from "@/assets/icon-user-mono.svg";
import { analyticsTrack } from "@/analytics/analytics";
import { ClipLoader } from "react-spinners";

interface PrayCardProps {
  currentUserId: string;
  groupId: string;
  member: MemberWithProfiles | null;
}

const MyPrayCardUI: React.FC<PrayCardProps> = ({
  currentUserId,
  groupId,
  member,
}) => {
  const userPrayCardList = useBaseStore((state) => state.userPrayCardList);
  const fetchUserPrayCardListByGroupId = useBaseStore(
    (state) => state.fetchUserPrayCardListByGroupId
  );

  const inputPrayCardContent = useBaseStore(
    (state) => state.inputPrayCardContent
  );
  const setPrayCardContent = useBaseStore((state) => state.setPrayCardContent);

  const isEditingPrayCard = useBaseStore((state) => state.isEditingPrayCard);
  const setIsEditingPrayCard = useBaseStore(
    (state) => state.setIsEditingPrayCard
  );

  const updateMember = useBaseStore((state) => state.updateMember);
  const updatePrayCardContent = useBaseStore(
    (state) => state.updatePrayCardContent
  );

  const reactionCounts = useBaseStore((state) => state.reactionCounts);
  const setReactionDatasForMe = useBaseStore(
    (state) => state.setReactionDatasForMe
  );

  const isOpenMyPrayDrawer = useBaseStore((state) => state.isOpenMyPrayDrawer);
  const setIsOpenMyPrayDrawer = useBaseStore(
    (state) => state.setIsOpenMyPrayDrawer
  );

  // TODO: 전역으로 변경 예정
  const [isDivVisible, setIsDivVisible] = useState(true);

  const onClickPrayerList = () => {
    analyticsTrack("클릭_기도카드_반응결과", { where: "MyPrayCard" });
  };

  const handleEditClick = () => {
    setIsEditingPrayCard(true);
    analyticsTrack("클릭_기도카드_수정", {});
  };

  const handleSaveClick = (
    prayCardId: string,
    content: string,
    memberId: string | undefined
  ) => {
    updatePrayCardContent(prayCardId, content);
    updateMember(memberId, content);
    setIsEditingPrayCard(false);
    setIsDivVisible(true);
    analyticsTrack("클릭_기도카드_저장", {});
  };

  // TODO: 본 과정에서 setReactionDatasForMe 처리할 수 있도록
  useEffect(() => {
    fetchUserPrayCardListByGroupId(currentUserId, groupId);
  }, [fetchUserPrayCardListByGroupId, currentUserId, groupId]);

  // TODO: useEffect 써야하는지 재고
  useEffect(() => {
    if (userPrayCardList && userPrayCardList[0]) {
      setReactionDatasForMe(userPrayCardList[0].pray);
    }
  }, [userPrayCardList, setReactionDatasForMe]);

  if (!userPrayCardList) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  const prayCard = userPrayCardList[0];

  const dateDistance = getDateDistance(
    new Date(
      getISOOnlyDate(
        prayCard?.created_at ?? member?.updated_at ?? getISOTodayDate()
      )
    ),
    new Date(getISOTodayDate())
  );

  const MyPrayCardBody = (
    <div className="flex flex-col flex-grow bg-white rounded-2xl shadow-prayCard">
      {isDivVisible && (
        <div className="bg-gradient-to-r from-start/60 via-middle/60 via-30% to-end/60 flex flex-col justify-center items-start gap-1 rounded-t-2xl p-5">
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
      )}
      <div
        className={`flex flex-col px-[20px] py-[20px] relative ${
          isDivVisible ? "h-full" : "h-[300px]"
        }`}
      >
        <Textarea
          className={`h-full w-full p-2 rounded-md overflow-y-auto  text-black !opacity-100 ${
            isEditingPrayCard ? " border-gray-300" : "border-none no-scrollbar"
          }`}
          value={inputPrayCardContent}
          onChange={(e) => setPrayCardContent(e.target.value)}
          disabled={!isEditingPrayCard}
          onFocus={() => setIsDivVisible(false)}
          onBlur={() =>
            handleSaveClick(prayCard!.id, inputPrayCardContent, member?.id)
          }
        />
        <div className="absolute top-2 right-2">
          {isEditingPrayCard ? (
            <button
              className={`text-white rounded-full bg-middle/90 w-8 h-8 flex justify-center items-center ${
                !inputPrayCardContent ? " opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() =>
                handleSaveClick(prayCard!.id, inputPrayCardContent, member?.id)
              }
              disabled={!inputPrayCardContent}
            >
              <FaSave className="text-white w-4 h-4" />
            </button>
          ) : (
            <button
              className="text-white rounded-full bg-end/90 w-8 h-8 flex justify-center items-center"
              onClick={() => handleEditClick()}
            >
              <FaEdit className="text-white w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 h-[70vh]">
      {MyPrayCardBody}
      <Drawer open={isOpenMyPrayDrawer} onOpenChange={setIsOpenMyPrayDrawer}>
        <DrawerTrigger
          className="w-full focus:outline-none"
          onClick={() => onClickPrayerList()}
        >
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
  );
};

export default MyPrayCardUI;
