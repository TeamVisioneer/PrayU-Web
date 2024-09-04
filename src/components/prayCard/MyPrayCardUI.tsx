import { useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import { MemberWithProfiles } from "supabase/types/tables";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import { getDateDistance } from "@toss/date";
import { getISODateYMD, getISOOnlyDate, getISOTodayDate } from "@/lib/utils";
import iconUserMono from "@/assets/icon-user-mono.svg";
import { analyticsTrack } from "@/analytics/analytics";
import { ClipLoader } from "react-spinners";
import { useRef } from "react";
import { Textarea } from "../ui/textarea";
import { toast } from "../ui/use-toast";
import MyPrayCardMoreBtn from "./MyPrayCardMoreBtn";

interface PrayCardProps {
  currentUserId: string;
  groupId: string;
  member: MemberWithProfiles;
}

const MyPrayCardUI: React.FC<PrayCardProps> = ({
  currentUserId,
  groupId,
  member,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
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
  const setIsOpenMyPrayDrawer = useBaseStore(
    (state) => state.setIsOpenMyPrayDrawer
  );

  const onClickPrayerList = () => {
    window.history.pushState(null, "", window.location.pathname);
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
    updatePrayCardContent(prayCardId, content);
    updateMember(memberId, content);
    setIsEditingPrayCard(false);
    analyticsTrack("클릭_기도카드_저장", {});
  };

  const onClickCopyPrayCard = () => {
    if (!inputPrayCardContent) {
      toast({
        description: "⚠︎ 기도제목을 작성해주세요",
      });
      return;
    }
    navigator.clipboard
      .writeText(inputPrayCardContent)
      .then(() => {
        toast({
          description: "기도제목이 복사되었어요 🔗",
        });
      })
      .catch((err) => {
        console.error("복사하는 중 오류가 발생했습니다: ", err);
      });

    analyticsTrack("클릭_기도카드_복사", {});
  };

  const onClickDeletePrayCard = () => {
    toast({
      description: "아직 개발중이에요 👀",
    });
    analyticsTrack("클릭_기도카드_삭제", {});
    return;
  };

  useEffect(() => {
    fetchUserPrayCardListByGroupId(currentUserId, groupId);
  }, [fetchUserPrayCardListByGroupId, currentUserId, groupId]);

  if (!userPrayCardList) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={20} color={"#70AAFF"} loading={true} />
      </div>
    );
  }

  if (userPrayCardList && userPrayCardList.length == 0) {
    // TODO: 예외처리 필요
    return null;
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
          <div className="bg-gradient-to-r from-start/60 via-middle/60 via-30% to-end/60 flex flex-col justify-center items-start gap-1 rounded-t-2xl p-5">
            <div className="flex items-center gap-2 w-full">
              <div className="flex gap-2 items-center">
                <p className="text-xl text-white">
                  기도 {dateDistance.days + 1}일차
                </p>
              </div>
            </div>
            <p className="text-xs text-white w-full text-left">
              시작일 : {createdDateYMD.year}.{createdDateYMD.month}.
              {createdDateYMD.day}
            </p>
          </div>
        )}
        <div className="flex flex-col flex-grow px-[20px] py-[20px] relative">
          <Textarea
            className="flex-grow w-full p-2 rounded-md overflow-y-auto no-scrollbar border-none focus:outline-gray-200 text-black"
            ref={textareaRef}
            value={inputPrayCardContent}
            placeholder="기도카드를 작성해주세요 ✏️"
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
    <div>
      <div className="flex justify-end px-2">
        <MyPrayCardMoreBtn
          handleEditClick={handleEditClick}
          onClickCopyPrayCard={onClickCopyPrayCard}
          onClickDeletePrayCard={onClickDeletePrayCard}
        />
      </div>
      <div className="flex flex-col gap-6 h-70vh ">
        {MyPrayCardBody}
        <div
          className="w-full focus:outline-none"
          onClick={() => onClickPrayerList()}
        >
          <div className="flex justify-center gap-2">
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
                  {
                    prayCard.pray.filter((pray) => pray.pray_type === type)
                      .length
                  }
                </div>
              </div>
            ))}
            <div className="bg-white rounded-lg flex justify-center items-center p-1">
              <img className="w-5" src={iconUserMono} alt="user-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPrayCardUI;
