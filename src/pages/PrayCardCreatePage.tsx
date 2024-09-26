import { analyticsTrack } from "@/analytics/analytics";
import useAuth from "@/hooks/useAuth";
import { getISOTodayDate, getISOTodayDateYMD } from "@/lib/utils";
import useBaseStore from "@/stores/baseStore";
import { Member } from "supabase/types/tables";
import prayerVerses from "@/data/prayCardTemplate.json";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import GroupMenuBtn from "@/components/group/GroupMenuBtn";
import { useParams } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";

const PrayCardCreatePage: React.FC = () => {
  const { user } = useAuth();
  const { groupId } = useParams<{ groupId: string }>();

  const targetGroup = useBaseStore((state) => state.targetGroup);
  const targetGroupLoading = useBaseStore((state) => state.targetGroupLoading);
  const getGroup = useBaseStore((state) => state.getGroup);
  const fetchGroupListByUserId = useBaseStore(
    (state) => state.fetchGroupListByUserId
  );
  const groupList = useBaseStore((state) => state.groupList);

  const memberList = useBaseStore((state) => state.memberList);
  const fetchMemberListByGroupId = useBaseStore(
    (state) => state.fetchMemberListByGroupId
  );
  const myMember = useBaseStore((state) => state.myMember);
  const memberLoading = useBaseStore((state) => state.memberLoading);
  const getMember = useBaseStore((state) => state.getMember);
  const createMember = useBaseStore((state) => state.createMember);
  const updateMember = useBaseStore((state) => state.updateMember);
  const createPrayCard = useBaseStore((state) => state.createPrayCard);

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
  const IsDisabledSkipPrayCardBtn = useBaseStore(
    (state) => state.isDisabledSkipPrayCardBtn
  );
  const setIsDisabledSkipPrayCardBtn = useBaseStore(
    (state) => state.setIsDisabledSkipPrayCardBtn
  );

  useEffect(() => {
    fetchGroupListByUserId(user!.id);
    if (groupId) getGroup(groupId);
    if (groupId) getMember(user!.id, groupId);
    if (groupId) fetchMemberListByGroupId(groupId);
  }, [
    getMember,
    fetchGroupListByUserId,
    fetchMemberListByGroupId,
    getGroup,
    user,
    groupId,
  ]);

  useEffect(() => {
    setPrayCardContent(myMember?.pray_summary || "");
  }, [myMember, setPrayCardContent]);

  if (targetGroupLoading == false && targetGroup == null)
    window.location.href = "/group/not-found";

  if (!groupList || !targetGroup || !memberList || memberLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={20} color={"#70AAFF"} loading={true} />
      </div>
    );
  }

  const getRandomVerse = () => {
    const randomIndex = Math.floor(Math.random() * prayerVerses.length);
    return `(${prayerVerses[randomIndex].verse})\n${prayerVerses[randomIndex].text}`;
  };

  const handleCreatePrayCard = async (
    currentUserId: string,
    groupId: string,
    content: string
  ) => {
    let updatedMember: Member | null;
    if (!myMember) {
      updatedMember = await createMember(groupId, currentUserId, content);
    } else {
      updatedMember = await updateMember(
        myMember.id,
        content,
        getISOTodayDate()
      );
    }
    if (!updatedMember) return;

    const newPrayCard = await createPrayCard(groupId, currentUserId, content);
    return newPrayCard;
  };

  const onClickSkipPrayCard = async (
    currentUserId: string,
    groupId: string
  ) => {
    setIsDisabledSkipPrayCardBtn(true);
    analyticsTrack("클릭_기도카드_다음에작성", {});
    const randomContent = getRandomVerse();
    const newPrayCard = await handleCreatePrayCard(
      currentUserId,
      groupId,
      randomContent
    );
    if (!newPrayCard) {
      setIsDisabledSkipPrayCardBtn(false);
      return null;
    }
    window.location.replace(`/group/${groupId}`);
  };

  const onClickJoinGroup = async (currentUserId: string, groupId: string) => {
    setIsDisabledPrayCardCreateBtn(true);
    analyticsTrack("클릭_기도카드_생성", { group_id: groupId });
    const newPrayCard = await handleCreatePrayCard(
      currentUserId,
      groupId,
      inputPrayCardContent
    );
    if (!newPrayCard) {
      setIsDisabledPrayCardCreateBtn(false);
      return null;
    }
    window.location.replace(`/group/${groupId}`);
  };

  const todayDateYMD = getISOTodayDateYMD();
  const filteredMemberList = myMember?.profiles.blocking_users
    ? memberList.filter(
        (member) =>
          member.user_id &&
          !myMember.profiles.blocking_users.includes(member.user_id)
      )
    : memberList;

  const PrayCardUI = (
    <div className="flex flex-col gap-6 justify-center">
      <div className="flex flex-col flex-grow min-h-full max-h-full bg-white rounded-2xl shadow-prayCard">
        <div className="flex flex-col justify-center items-start gap-1 bg-gradient-to-r from-start via-middle via-30% to-end rounded-t-2xl p-5">
          <div className="flex items-center gap-2">
            <img
              src={
                myMember
                  ? myMember?.profiles.avatar_url ||
                    "/images/defaultProfileImage.png"
                  : user?.user_metadata.avatar_url ||
                    "/images/defaultProfileImage.png"
              }
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                e.currentTarget.src = "/images/defaultProfileImage.png";
              }}
              className="w-7 h-7 rounded-full object-cover"
            />
            <p className="text-white text-lg ">
              {myMember
                ? myMember?.profiles.full_name
                : user?.user_metadata.full_name}
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
            placeholder={`기도카드를 작성해 보아요 ✏️\n내용은 작성 후에도 수정할 수 있어요 :)\n\n1. PrayU와 함께 기도할 수 있기를\n2. `}
          />
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
          <span className="text-sm text-gray-500">
            {filteredMemberList.length}
          </span>
        </div>
        <div className="w-[48px] flex justify-center">
          <GroupMenuBtn userGroupList={groupList} targetGroup={targetGroup} />
        </div>
      </div>

      <p>당신의 기도제목을 알려주세요 😁</p>
      <div className="w-full px-5">{PrayCardUI}</div>

      <div className="flex flex-col items-center w-full p-5 gap-4">
        <Button
          className="w-full"
          onClick={() => onClickJoinGroup(user!.id, targetGroup.id)}
          disabled={isDisabledPrayCardCreateBtn}
          variant="primary"
        >
          그룹 참여하기
        </Button>
        {!inputPrayCardContent && (
          <Button
            className="w-full"
            onClick={() => onClickSkipPrayCard(user!.id, targetGroup.id)}
            disabled={IsDisabledSkipPrayCardBtn}
            variant="primaryLight"
          >
            다음에 작성하기
          </Button>
        )}
      </div>
    </div>
  );
};

export default PrayCardCreatePage;
