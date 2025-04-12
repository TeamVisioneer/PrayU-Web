import React, { useEffect, useState } from "react";
import { Member } from "supabase/types/tables";
import { useParams, useNavigate } from "react-router-dom";
import useBaseStore from "@/stores/baseStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { UserRound, X } from "lucide-react";
import { analyticsTrack } from "@/analytics/analytics";
import { getISOTodayDate } from "@/lib/utils";
import { PulseLoader } from "react-spinners";
import LogInDrawer from "@/components/auth/LogInDrawer";
import check from "@/assets/lottie/check2.json";
import Lottie from "react-lottie";
import { NotificationType } from "@/components/notification/NotificationType";

const GroupJoinPage: React.FC = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [isJoining, setIsJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  const createMember = useBaseStore((state) => state.createMember);
  const updateMember = useBaseStore((state) => state.updateMember);
  const getMember = useBaseStore((state) => state.getMember);
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const targetGroupLoading = useBaseStore((state) => state.targetGroupLoading);
  const getGroup = useBaseStore((state) => state.getGroup);
  const memberList = useBaseStore((state) => state.memberList);
  const fetchMemberListByGroupId = useBaseStore(
    (state) => state.fetchMemberListByGroupId
  );
  const myMemberList = useBaseStore((state) => state.myMemberList);
  const fetchMemberListByUserId = useBaseStore(
    (state) => state.fetchMemberListByUserId
  );
  const user = useBaseStore((state) => state.user);
  const setIsOpenLoginDrawer = useBaseStore(
    (state) => state.setIsOpenLoginDrawer
  );
  const userPlan = useBaseStore((state) => state.userPlan);
  const createNotification = useBaseStore((state) => state.createNotification);
  const createOnesignalPush = useBaseStore(
    (state) => state.createOnesignalPush
  );

  useEffect(() => {
    if (user) fetchMemberListByUserId(user.id);
    if (groupId) {
      getGroup(groupId);
      fetchMemberListByGroupId(groupId);
    }
  }, [
    user,
    groupId,
    getGroup,
    fetchMemberListByGroupId,
    fetchMemberListByUserId,
  ]);

  useEffect(() => {
    const maxGroupCount = Number(import.meta.env.VITE_MAX_GROUP_COUNT);
    if (
      myMemberList &&
      myMemberList.length >= maxGroupCount &&
      myMemberList.every((member) => member.group_id !== groupId) &&
      userPlan != "Premium"
    ) {
      navigate("/group/limit", { replace: true });
      return;
    }
  }, [myMemberList, groupId, userPlan, navigate]);

  const sendNotification = async (member: Member) => {
    if (!memberList || !targetGroup) return;

    const title = "입장 알림";
    const description = `${user?.user_metadata.name}님이 기도그룹에 참여했어요!`;

    await createOnesignalPush({
      title: "PrayU",
      subtitle: title,
      message: description,
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
      title: title,
      body: description,
      type: NotificationType.SNS,
    });
  };

  const handleJoinGroup = async () => {
    analyticsTrack("클릭_그룹_참여", { where: "GroupJoinPage" });
    if (!user) {
      setIsOpenLoginDrawer(true);
      return;
    }
    if (!groupId || !targetGroup) return;

    try {
      setIsJoining(true);
      const updatedAt = getISOTodayDate();
      const myMember = await getMember(user.id, groupId);
      let newMember;

      if (myMember) {
        newMember = await updateMember(myMember.id, "", updatedAt);
      } else {
        newMember = await createMember(groupId, user.id, "");
      }

      if (!newMember) return;
      await sendNotification(newMember);

      setJoined(true);
    } catch (error) {
      setIsJoining(false);
    }
  };

  const handleContinueInApp = () => {
    analyticsTrack("클릭_앱설치", { where: "GroupJoinPage" });
    if (navigator.userAgent.match(/Android/i)) {
      window.location.href =
        "https://play.google.com/store/apps/details?id=com.team.visioneer.prayu";
    } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
      window.location.href =
        "https://itunes.apple.com/kr/app/apple-store/id6711345171";
    } else {
      window.location.href = "https://linktr.ee/prayu.site";
    }
  };

  const isAlreadyMember = memberList?.some(
    (member) => member.user_id === user?.id
  );

  // Header component for reuse
  const Header = () => (
    <div className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 border-b z-10 max-w-[480px] mx-auto">
      <button onClick={() => navigate("/")} className="p-2">
        <X size={20} />
      </button>
      <h1 className="text-lg font-semibold">그룹초대</h1>
      <div className="w-[20px]"></div>
    </div>
  );

  if (targetGroupLoading || !memberList) {
    return (
      <div className="p-5 flex flex-col h-full gap-4 pt-[48px]">
        <Skeleton className="w-full h-[150px] flex items-center gap-4 p-4 bg-gray-200 rounded-xl" />
        <Skeleton className="w-full flex-grow flex items-center gap-4 p-4 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (!targetGroup) {
    return (
      <div className="p-5 flex flex-col h-full gap-4 pt-[48px] items-center justify-center text-center">
        <h1 className="text-2xl font-bold">그룹을 찾을 수 없습니다</h1>
        <p className="text-gray-500">
          초대 링크가 유효하지 않거나 그룹이 삭제되었습니다.
        </p>
        <Button className="mt-4" onClick={() => navigate("/")}>
          돌아가기
        </Button>
      </div>
    );
  }

  if (joined) {
    return (
      <div className="flex flex-col h-full bg-mainbg">
        <Header />

        <div className="flex flex-col px-5 py-8 flex-grow items-center justify-center">
          <div className="flex flex-col items-center p-8 pt-0 text-center max-w-md w-full">
            <Lottie
              height={200}
              width={200}
              options={{
                loop: false,
                autoplay: true,
                animationData: check,
              }}
            />
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-800">
                  참여 완료!
                </h3>
                <p className="text-sm text-gray-600">
                  {targetGroup.name} 그룹에 성공적으로 참여하였습니다
                </p>
              </div>

              <Button
                variant="primary"
                className="w-full py-6 "
                onClick={handleContinueInApp}
              >
                PrayU 앱에서 계속하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-mainbg">
      <LogInDrawer path={`/group/${groupId}/join`} />

      <Header />

      <div className="flex flex-col px-5 py-8 flex-grow items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-6 w-full max-w-md">
          <div className="flex flex-col items-center gap-6">
            {/* Group Icon/Avatar */}
            <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center mb-1 overflow-hidden border-4 border-white shadow-md">
              <img
                src="https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/invite.png"
                alt="PrayU 그룹 초대"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {targetGroup.name}
              </h2>

              <p className="text-base text-gray-600 mb-4">
                {targetGroup.name}에서 그룹 초대 요청을 보냈어요
              </p>
            </div>

            {/* Member List */}
            <div className="flex items-center mb-2">
              {memberList.slice(0, 2).map((member, index) => (
                <div
                  key={member.id}
                  className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white"
                  style={{ marginLeft: index > 0 ? "-10px" : "0" }}
                >
                  {member.profiles.avatar_url ? (
                    <img
                      src={member.profiles.avatar_url}
                      alt={member.profiles.username || "사용자"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-violet-100">
                      <UserRound size={18} className="text-violet-500" />
                    </div>
                  )}
                </div>
              ))}
              {memberList.length > 2 && (
                <div
                  className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center border-2 border-white text-violet-500 font-medium"
                  style={{ marginLeft: "-10px" }}
                >
                  +{memberList.length - 2}
                </div>
              )}
              <span className=" text-gray-500 ml-3">
                {memberList.length}명이 그룹에 참여 중이에요!
              </span>
            </div>

            {/* Join Button */}
            {isAlreadyMember ? (
              <div className="w-full flex flex-col items-center gap-2">
                <Button
                  variant="secondary"
                  className="w-5/6 py-6 rounded-lg"
                  disabled={true}
                >
                  이미 참여한 그룹입니다
                </Button>
                <Button
                  variant="primary"
                  className="w-5/6 py-6 rounded-lg"
                  onClick={handleContinueInApp}
                >
                  PrayU 앱에서 계속하기
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                className="w-5/6 py-6"
                onClick={handleJoinGroup}
                disabled={isJoining || isAlreadyMember}
              >
                {isJoining ? (
                  <PulseLoader size={10} color="#f3f4f6" />
                ) : (
                  "그룹 참여하기"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupJoinPage;
