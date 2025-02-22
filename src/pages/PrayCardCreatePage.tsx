import { analyticsTrack } from "@/analytics/analytics";
import useAuth from "@/hooks/useAuth";
import { getISOTodayDate } from "@/lib/utils";
import useBaseStore from "@/stores/baseStore";
import { Member } from "supabase/types/tables";
import prayerVerses from "@/data/prayCardTemplate.json";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import { KakaoController } from "@/components/kakao/KakaoController";
import { MemberJoinMessage } from "@/components/kakao/KakaoMessage";
import { NotificationType } from "@/components/notification/NotificationType";
import { KakaoTokenRepo } from "@/components/kakao/KakaoTokenRepo";
import { PulseLoader } from "react-spinners";
import GroupSettingsDialog from "@/components/group/GroupSettingsDialog";
import GroupHeader from "@/components/group/GroupHeader";
import ShareDrawer from "@/components/share/ShareDrawer";
import GroupListDrawer from "@/components/group/GroupListDrawer";
import InfoBtn from "@/components/alert/infoBtn";

const PrayCardCreatePage: React.FC = () => {
  const { user } = useAuth();
  const { groupId } = useParams<{ groupId: string }>();

  const targetGroup = useBaseStore((state) => state.targetGroup);
  const targetGroupLoading = useBaseStore((state) => state.targetGroupLoading);
  const getGroup = useBaseStore((state) => state.getGroup);
  const memberList = useBaseStore((state) => state.memberList);
  const fetchMemberListByGroupId = useBaseStore(
    (state) => state.fetchMemberListByGroupId
  );
  const myMember = useBaseStore((state) => state.myMember);
  const memberLoading = useBaseStore((state) => state.memberLoading);
  const getMember = useBaseStore((state) => state.getMember);
  const createMember = useBaseStore((state) => state.createMember);
  const updateMember = useBaseStore((state) => state.updateMember);
  const createPrayCardWithParams = useBaseStore(
    (state) => state.createPrayCardWithParams
  );

  const inputPrayCardContent = useBaseStore(
    (state) => state.inputPrayCardContent
  );
  const setPrayCardContent = useBaseStore((state) => state.setPrayCardContent);
  const isDisabledPrayCardCreateBtn = useBaseStore(
    (state) => state.isDisabledPrayCardCreateBtn
  );
  const setIsDisabledPrayCardCreateBtn = useBaseStore(
    (state) => state.setIsDisabledPrayCardCreateBtn
  );
  const IsDisabledSkipPrayCardBtn = useBaseStore(
    (state) => state.isDisabledSkipPrayCardBtn
  );
  const setIsDisabledSkipPrayCardBtn = useBaseStore(
    (state) => state.setIsDisabledSkipPrayCardBtn
  );
  const createNotification = useBaseStore((state) => state.createNotification);
  const createOnesignalPush = useBaseStore(
    (state) => state.createOnesignalPush
  );
  const userPrayCardList = useBaseStore((state) => state.userPrayCardList);
  const fetchUserPrayCardListByGroupId = useBaseStore(
    (state) => state.fetchUserPrayCardListByGroupId
  );
  const setIsConfirmAlertOpen = useBaseStore(
    (state) => state.setIsConfirmAlertOpen
  );
  const setAlertData = useBaseStore((state) => state.setAlertData);
  const fetchNotificationCount = useBaseStore(
    (state) => state.fetchNotificationCount
  );

  const inputPrayCardLife = useBaseStore((state) => state.inputPrayCardLife);
  const setPrayCardLife = useBaseStore((state) => state.setPrayCardLife);

  const loadPrayCardLife = () => {
    if (userPrayCardList?.[0]?.life) {
      setPrayCardLife(userPrayCardList[0].life);
    }
  };

  const loadPrayCardContent = () => {
    if (userPrayCardList?.[0]?.content) {
      setPrayCardContent(userPrayCardList[0].content);
    }
  };

  useEffect(() => {
    if (user) fetchNotificationCount(user.id, true);
    if (user && groupId) fetchUserPrayCardListByGroupId(user.id, groupId);
    if (groupId) getGroup(groupId);
    if (groupId) getMember(user!.id, groupId);
    if (groupId) fetchMemberListByGroupId(groupId);
  }, [
    getMember,
    fetchUserPrayCardListByGroupId,
    fetchMemberListByGroupId,
    fetchNotificationCount,
    getGroup,
    user,
    groupId,
  ]);

  useEffect(() => {
    if (targetGroup) {
      setIsConfirmAlertOpen(true);
      setAlertData({
        color: "bg-blue-500",
        title: "기도카드 만료 안내",
        description: `${targetGroup.name}의 기도카드가 만료되었어요😭\n이번 주 기도카드를 만들어 주세요!`,
        actionText: "확인",
        onAction: () => {},
      });
    }
  }, [targetGroup, myMember, setIsConfirmAlertOpen, setAlertData]);

  if (targetGroupLoading == false && targetGroup == null)
    window.location.href = "/group/not-found";

  if (!targetGroup || !memberList || memberLoading || !userPrayCardList) {
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

  const upsertMember = async (
    currentUserId: string,
    groupId: string,
    content: string
  ) => {
    let upsertedMember: Member | null;
    if (!myMember) {
      upsertedMember = await createMember(groupId, currentUserId, content);
    } else {
      upsertedMember = await updateMember(
        myMember.id,
        content,
        getISOTodayDate()
      );
    }
    return upsertedMember;
  };
  const sendNotification = async (member: Member) => {
    // TODO: 카카오 메세지 재기획 이후 진행
    const kakaoMessageEnabled = false;
    if (kakaoMessageEnabled) {
      await KakaoTokenRepo.init();
      await KakaoController.sendDirectMessage(
        MemberJoinMessage(user?.user_metadata.name, targetGroup.id),
        targetGroup.profiles.kakao_id
      );
    }
    // TODO END

    const subtitle =
      member.created_at === member.updated_at ? "입장 알림" : "기도카드 알림";
    const message =
      member.created_at === member.updated_at
        ? `${user?.user_metadata.name}님이 기도그룹에 참여했어요!`
        : `${targetGroup.name}에 새로운 기도카드가 등록되었어요!`;

    await createOnesignalPush({
      title: "PrayU",
      subtitle: subtitle,
      message: message,
      data: {
        url: `${import.meta.env.VITE_BASE_URL}/group/${targetGroup.id}`,
      },
      userIds: memberList
        .map((member) => member.user_id!)
        .filter((userId) => userId !== member.user_id!),
    });

    await createNotification({
      groupId: targetGroup.id,
      userId: memberList
        .map((member) => member.user_id!)
        .filter((userId) => userId !== member.user_id!),
      senderId: member.user_id!,
      title: subtitle,
      body: message,
      type: NotificationType.SNS,
    });
  };

  const onClickSkipPrayCard = async (
    currentUserId: string,
    groupId: string
  ) => {
    setIsDisabledSkipPrayCardBtn(true);
    analyticsTrack("클릭_기도카드_다음에작성", {});
    const randomContent = getRandomVerse();
    const upsertedMember = await upsertMember(
      currentUserId,
      groupId,
      randomContent
    );
    if (!upsertedMember) {
      setIsDisabledSkipPrayCardBtn(false);
      return null;
    }
    const newPrayCard = await createPrayCardWithParams({
      group_id: groupId,
      user_id: currentUserId,
      content: randomContent,
    });
    if (newPrayCard) await sendNotification(upsertedMember);
    window.location.replace(`/group/${groupId}`);
  };

  const onClickJoinGroup = async (currentUserId: string, groupId: string) => {
    setIsDisabledPrayCardCreateBtn(true);
    analyticsTrack("클릭_기도카드_생성", { group_id: groupId });
    const upsertedMember = await upsertMember(
      currentUserId,
      groupId,
      inputPrayCardContent
    );
    if (!upsertedMember) {
      setIsDisabledSkipPrayCardBtn(false);
      return null;
    }
    const newPrayCard = await createPrayCardWithParams({
      group_id: groupId,
      user_id: currentUserId,
      content: inputPrayCardContent,
      life: inputPrayCardLife,
    });
    if (newPrayCard) await sendNotification(upsertedMember);
    window.location.replace(`/group/${groupId}`);
  };

  const PrayCardUI = (
    <div className="w-full flex flex-col flex-grow overflow-y-auto no-scrollbar bg-white rounded-2xl shadow-prayCard">
      <div className="z-30 min-h-14 px-4 my-4 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={
              myMember
                ? myMember?.profiles.avatar_url ||
                  "/images/defaultProfileImage.png"
                : user?.user_metadata.picture ||
                  "/images/defaultProfileImage.png"
            }
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              e.currentTarget.src = "/images/defaultProfileImage.png";
            }}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-lg font-medium">
            {myMember ? myMember?.profiles.full_name : user?.user_metadata.name}
          </span>
          <span className="text-gray-400">오늘</span>
        </div>
      </div>

      <div className="flex flex-col px-4 pb-4 overflow-y-auto no-scrollbar">
        <section>
          <div className="sticky top-0 py-2 flex items-center gap-1 z-20 bg-white">
            <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
              지난 한 주
            </h3>
            <InfoBtn
              text={[
                "기도카드에 <지난 한 주> 항목이 추가되었어요!",
                "기도제목보다 가벼운 일상을 나눠보세요 🙂",
              ]}
              eventOption={{ where: "PrayCardEditPage" }}
              position="start"
            />
            <div className="flex-grow" />
            <Button
              variant="ghost"
              size="sm"
              onClick={loadPrayCardLife}
              disabled={!userPrayCardList?.[0]?.life}
              className="text-xs text-blue-500 hover:text-blue-600"
            >
              내용 불러오기
            </Button>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <textarea
              className="text-sm w-full bg-transparent text-gray-700 !opacity-100 !border-none !cursor-default focus:outline-none focus:border-none"
              value={inputPrayCardLife}
              onChange={(e) => setPrayCardLife(e.target.value)}
              placeholder="회사에서 업무적, 관계적으로 힘들었던 한 주"
            />
          </div>
        </section>

        <section>
          <div className="sticky top-0 py-2 flex items-center gap-1 z-20 bg-white">
            <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
              이번 주 기도제목
            </h3>
            <div className="flex-grow" />
            <Button
              variant="ghost"
              size="sm"
              onClick={loadPrayCardContent}
              disabled={!userPrayCardList?.[0]?.content}
              className="text-xs text-blue-500 hover:text-blue-600"
            >
              기도제목 불러오기
            </Button>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <textarea
              className="text-sm w-full bg-transparent resize-none text-gray-700 !opacity-100 !border-none !cursor-default focus:outline-none focus:border-none"
              value={inputPrayCardContent}
              onChange={(e) => setPrayCardContent(e.target.value)}
              placeholder={`1. 맡겨진 자리에서 하나님의 사명을 발견할 수 있도록\n2. 내 주변 사람을 내 몸과 같이 섬길 수 있도록`}
              rows={4}
            />
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <div className="w-full ">
      <GroupHeader />
      <div className="w-full flex flex-col items-center px-5 gap-3">
        <p>이번 주 기도카드를 만들고 그룹에 참여해요 🙏🏻</p>
        {PrayCardUI}

        <div className="flex flex-col items-center w-full gap-4">
          {inputPrayCardContent || inputPrayCardLife ? (
            <Button
              className="w-full"
              onClick={() => onClickJoinGroup(user!.id, targetGroup.id)}
              disabled={isDisabledPrayCardCreateBtn}
              variant="primary"
            >
              {isDisabledPrayCardCreateBtn ? (
                <PulseLoader size={10} color="#f3f4f6" />
              ) : myMember?.pray_summary ? (
                "기도카드 만들기"
              ) : (
                "그룹 참여하기"
              )}
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={() => onClickSkipPrayCard(user!.id, targetGroup.id)}
              disabled={IsDisabledSkipPrayCardBtn}
              variant="primaryLight"
            >
              {IsDisabledSkipPrayCardBtn ? (
                <PulseLoader size={10} color="#f3f4f6" />
              ) : (
                "다음에 작성하기"
              )}
            </Button>
          )}
        </div>
      </div>
      <GroupSettingsDialog targetGroup={targetGroup} />
      <ShareDrawer />
      <GroupListDrawer />
    </div>
  );
};

export default PrayCardCreatePage;
