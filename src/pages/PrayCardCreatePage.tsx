import { analyticsTrack } from "@/analytics/analytics";
import useAuth from "@/hooks/useAuth";
import { getISOTodayDate, getISOTodayDateYMD } from "@/lib/utils";
import useBaseStore from "@/stores/baseStore";
import { Member } from "supabase/types/tables";
import prayerVerses from "@/data/prayCardTemplate.json";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import GroupMenuBtn from "@/components/group/GroupMenuBtn";

const PrayCardCreatePage: React.FC = () => {
  const { user } = useAuth();

  const groupList = useBaseStore((state) => state.groupList);
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const myMember = useBaseStore((state) => state.myMember);
  const memberList = useBaseStore((state) => state.memberList);

  const inputPrayCardContent = useBaseStore(
    (state) => state.inputPrayCardContent
  );
  const setPrayCardContent = useBaseStore((state) => state.setPrayCardContent);
  const isDisabledPrayCardCreateBtn = useBaseStore(
    (state) => state.isDisabledPrayCardCreateBtn
  );
  const setIsDisabledPrayCardCreateBtn = useBaseStore(
    (state) => state.setIsDisabledGroupCreateBtn
  );
  const getMember = useBaseStore((state) => state.getMember);
  const createMember = useBaseStore((state) => state.createMember);
  const updateMember = useBaseStore((state) => state.updateMember);
  const createPrayCard = useBaseStore((state) => state.createPrayCard);

  const getRandomVerse = () => {
    const randomIndex = Math.floor(Math.random() * prayerVerses.length);
    return `(${prayerVerses[randomIndex].verse})\n${prayerVerses[randomIndex].text}`;
  };

  const onClickPrayCardTemplate = () => {
    analyticsTrack("클릭_기도카드_템플릿", {});
    setPrayCardContent(getRandomVerse());
  };

  const handleCreatePrayCard = async (
    currentUserId: string,
    groupId: string
  ) => {
    setIsDisabledPrayCardCreateBtn(true);
    analyticsTrack("클릭_기도카드_생성", { group_id: groupId });
    const member = await getMember(currentUserId, groupId);
    let updatedMember: Member | null;
    if (!member) {
      updatedMember = await createMember(
        groupId,
        currentUserId,
        inputPrayCardContent
      );
    } else {
      updatedMember = await updateMember(
        member.id,
        inputPrayCardContent,
        getISOTodayDate()
      );
    }
    if (!updatedMember) {
      setIsDisabledPrayCardCreateBtn(false);
      return;
    }
    const newPrayCard = await createPrayCard(
      groupId,
      currentUserId,
      inputPrayCardContent
    );
    if (!newPrayCard) {
      setIsDisabledPrayCardCreateBtn(false);
      return;
    }
    window.location.replace(`/group/${groupId}`);
  };

  useEffect(() => {
    setPrayCardContent(myMember?.pray_summary || "");
  }, [myMember, setPrayCardContent]);

  if (targetGroup == null || memberList == null) {
    return (
      <div className="h-screen flex flex-col justify-center items-center gap-2">
        <div>그룹을 찾을 수 없어요😂</div>
        <a href="/" className="text-sm underline text-gray-400">
          PrayU 홈으로
        </a>
      </div>
    );
  }

  const todayDateYMD = getISOTodayDateYMD();

  const PrayCardUI = (
    <div className="flex flex-col gap-6 justify-center">
      <div className="flex flex-col flex-grow min-h-full max-h-full bg-white rounded-2xl shadow-prayCard">
        <div className="flex flex-col justify-center items-start gap-1 bg-gradient-to-r from-start/60 via-middle/60 via-30% to-end/60 rounded-t-2xl p-5">
          <div className="flex items-center gap-2">
            <img
              src={
                user?.user_metadata.avatar_url ||
                "/images/defaultProfileImage.png"
              }
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                e.currentTarget.src = "/images/defaultProfileImage.png";
              }}
              className="w-7 h-7 rounded-full object-cover"
            />
            <p className="text-white text-lg ">
              {user?.user_metadata.full_name}
            </p>
          </div>
          <p className="text-sm text-white w-full text-left">
            시작일 :{todayDateYMD.year}.{todayDateYMD.month}.{todayDateYMD.day}
          </p>
        </div>
        <div className="flex flex-col flex-grow min-h-[300px] px-[10px] py-[10px] overflow-y-auto no-scrollbar items-center">
          <textarea
            className="text-sm flex-grow w-full p-2 rounded-md overflow-y-auto no-scrollbar text-gray-700 !opacity-100 !border-none !cursor-default focus:outline-none focus:border-none"
            value={inputPrayCardContent}
            onChange={(e) => setPrayCardContent(e.target.value)}
            placeholder={`기도제목은 수정할 수 있어요 :)\n\n1. PrayU와 함께 기도할 수 있기를\n2. `}
          />
          {!inputPrayCardContent && (
            <p
              className="text-xs text-gray-500 underline"
              onClick={() => onClickPrayCardTemplate()}
            >
              기도카드 템플릿 사용하기
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full flex justify-between items-center">
        <div className="w-[48px]"></div>
        <div className="text-lg font-bold flex items-center gap-1">
          <div className="max-w-52 whitespace-nowrap overflow-hidden text-ellipsis">
            {targetGroup.name}
          </div>
          <span className="text-sm text-gray-500">{memberList.length}</span>
        </div>
        <div className="w-[48px] flex justify-center">
          <GroupMenuBtn
            userGroupList={groupList || []}
            targetGroup={targetGroup}
          />
        </div>
      </div>

      <p>당신의 기도제목을 알려주세요 😁</p>
      <div className="w-full px-5">{PrayCardUI}</div>

      <div className="flex flex-col w-full p-5 gap-2">
        <Button
          className="w-full"
          onClick={() => handleCreatePrayCard(user!.id, targetGroup.id)}
          disabled={isDisabledPrayCardCreateBtn}
          variant="primary"
        >
          그룹 참여하기
        </Button>
      </div>
    </div>
  );
};

export default PrayCardCreatePage;
