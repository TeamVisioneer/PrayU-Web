import useBaseStore from "@/stores/baseStore";
import { MemberWithProfiles } from "supabase/types/tables";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import { getDateDistance } from "@toss/date";
import {
  getISODateYMD,
  getISOOnlyDate,
  getISOTodayDate,
  getWeekInfo,
} from "@/lib/utils";
import iconUserMono from "@/assets/icon-user-mono.svg";
import { analyticsTrack } from "@/analytics/analytics";
import { useRef } from "react";
import { Textarea } from "../ui/textarea";
import MyPrayCardMenuBtn from "./MyPrayCardMenuBtn";
import ExpiredPrayCardUI from "./ExpiredPrayCardUI";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";

interface PrayCardProps {
  member: MemberWithProfiles;
}

const MyPrayCardUI: React.FC<PrayCardProps> = ({ member }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const userPrayCardList = useBaseStore((state) => state.userPrayCardList);

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
  const setIsOpenMyPrayDrawer = useBaseStore(
    (state) => state.setIsOpenMyPrayDrawer
  );

  const onClickPrayerList = () => {
    setIsOpenMyPrayDrawer(true);
    analyticsTrack("클릭_기도카드_반응결과", { where: "MyPrayCard" });
  };

  const handleEditClick = () => {
    if (textareaRef.current) textareaRef.current.focus();
    setIsEditingPrayCard(true);
    analyticsTrack("클릭_기도카드_수정", {});
  };

  const handleSaveClick = (
    prayCardId: string,
    content: string,
    memberId: string
  ) => {
    updatePrayCardContent(prayCardId, content.trim());
    updateMember(memberId, content);
    setIsEditingPrayCard(false);
    analyticsTrack("클릭_기도카드_저장", {});
  };

  if (!userPrayCardList) {
    return (
      <div className="flex justify-center items-center min-h-80vh max-h-80vh px-10 pt-[68px]">
        <Skeleton className="w-full h-[300px] flex items-center gap-4 p-4 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (
    userPrayCardList &&
    (userPrayCardList.length == 0 ||
      getWeekInfo(userPrayCardList[0].created_at)["weekDates"][6] <
        getISOTodayDate())
  ) {
    return <ExpiredPrayCardUI />;
  }

  const prayCard = userPrayCardList[0];
  const createdDateYMD = getISODateYMD(prayCard.created_at);

  const dateDistance = getDateDistance(
    new Date(getISOOnlyDate(prayCard.created_at)),
    new Date(getISOTodayDate())
  );

  const MyPrayCardBody = (
    <div className="flex flex-col flex-grow">
      <div
        className={`flex flex-col bg-white rounded-2xl shadow-prayCard ${
          isEditingPrayCard ? "h-[300px]" : "flex-grow"
        }`}
      >
        {!isEditingPrayCard && (
          <div className="bg-gradient-to-r from-start via-middle via-52% to-end flex flex-col justify-center items-start gap-1 rounded-t-2xl p-5">
            <div className="flex items-center gap-2 w-full">
              <div className="flex gap-2 items-center">
                <p className="text-xl text-white">
                  기도 {dateDistance.days + 1}일차
                </p>
              </div>
            </div>
            <p className="text-sm text-white w-full text-left">
              시작일 : {createdDateYMD.year}.{createdDateYMD.month}.
              {createdDateYMD.day}
            </p>
          </div>
        )}
        <div className="flex flex-col flex-grow relative">
          <Textarea
            className="flex-grow w-full p-4  rounded-2xl overflow-y-auto no-scrollbar border-none focus:outline-gray-200 text-black"
            ref={textareaRef}
            value={inputPrayCardContent}
            placeholder={`기도카드를 작성해 보아요 ✏️\n내용은 작성 후에도 수정할 수 있어요 :)\n\n1. PrayU와 함께 기도할 수 있기를\n2. `}
            onChange={(e) => setPrayCardContent(e.target.value)}
            onFocus={() => setIsEditingPrayCard(true)}
            onBlur={() =>
              handleSaveClick(prayCard.id, inputPrayCardContent, member.id)
            }
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col px-10 gap-2 h-70vh">
      <div className="flex justify-end px-2">
        {!isEditingPrayCard ? (
          <MyPrayCardMenuBtn
            handleEditClick={handleEditClick}
            prayCard={prayCard}
          />
        ) : (
          <Badge className="absolute top-3 right-3 w-12 px-0 flex items-center justify-center">
            완료
          </Badge>
        )}
      </div>
      {MyPrayCardBody}
      <div
        className="flex justify-center focus:outline-none gap-2 mt-4"
        onClick={() => onClickPrayerList()}
      >
        {Object.values(PrayType).map((type) => (
          <div
            key={type}
            className="w-[60px] py-1 px-2 flex rounded-lg bg-white text-black gap-2"
          >
            <div className="text-sm w-5 h-5">
              <img
                src={PrayTypeDatas[type].img}
                alt={PrayTypeDatas[type].emoji}
                className="w-5 h-5"
              />
            </div>
            <div className="text-sm">
              {prayCard.pray.filter((pray) => pray.pray_type === type).length}
            </div>
          </div>
        ))}
        <div className="bg-white rounded-lg flex justify-center items-center p-1">
          <img className="w-5" src={iconUserMono} alt="user-icon" />
        </div>
      </div>
    </div>
  );
};

export default MyPrayCardUI;
