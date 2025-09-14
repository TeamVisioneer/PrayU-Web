import OtherMember from "./OtherMember";
import DummyOtherMember from "./DummyOtherMember";
import InviteBanner from "../notice/InviteBanner";
import RewardBanner from "../notice/RewardBanner";
import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";
import { MemberWithProfiles } from "supabase/types/tables";
import useRealtimeMember from "./useRealtimeMember";
import InviteOtherMember from "./InviteOtherMember";
import { Skeleton } from "../ui/skeleton";
import ShowMoreBtn from "../common/ShowMoreBtn";

const OtherMemberList: React.FC = () => {
  const myMember = useBaseStore((state) => state.myMember);
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const groupList = useBaseStore((state) => state.groupList);
  const memberList = useBaseStore((state) => state.memberList);
  const memberListView = useBaseStore((state) => state.memberListView);
  const fetchMemberListByGroupId = useBaseStore(
    (state) => state.fetchMemberListByGroupId
  );
  const fetchMemberCountByGroupId = useBaseStore(
    (state) => state.fetchMemberCountByGroupId
  );
  const setMemberList = useBaseStore((state) => state.setMemberList);
  const setMemberListView = useBaseStore((state) => state.setMemberListView);
  const memberCount = useBaseStore((state) => state.memberCount);

  const memberListPageSize = useBaseStore((state) => state.memberListPageSize);
  const memberListOffset = useBaseStore((state) => state.memberListOffset);
  const setMemberListOffset = useBaseStore(
    (state) => state.setMemberListOffset
  );

  useEffect(() => {
    if (targetGroup) {
      fetchMemberListByGroupId(targetGroup.id);
      fetchMemberCountByGroupId(targetGroup.id);
    }
  }, [fetchMemberListByGroupId, fetchMemberCountByGroupId, targetGroup]);

  useRealtimeMember(targetGroup?.id, async () => {
    if (!targetGroup) return;
    const memberList = await fetchMemberListByGroupId(targetGroup.id);
    if (!memberList) return;
    setMemberListView([...memberListView, ...memberList]);
  });

  useEffect(() => {
    const filteredMemberList = myMember?.profiles.blocking_users
      ? memberList?.filter(
          (member) =>
            member.user_id &&
            !myMember.profiles.blocking_users.includes(member.user_id)
        )
      : memberList;
    if (filteredMemberList && memberListView.length == 0) {
      setMemberListView([...filteredMemberList]);
    }
  }, [memberList, memberListView, setMemberListView, myMember]);

  const onClickMoreMemberList = async () => {
    if (!targetGroup || !memberCount) return;
    if (memberListOffset >= memberCount) return;

    setMemberList(null);
    const limit =
      memberListOffset > memberCount
        ? memberCount - memberListOffset
        : memberListPageSize;
    const newMemberList = await fetchMemberListByGroupId(
      targetGroup.id,
      limit,
      memberListOffset
    );
    if (!newMemberList) return;
    const filteredMemberList = myMember?.profiles.blocking_users
      ? newMemberList?.filter(
          (member) =>
            member.user_id &&
            !myMember.profiles.blocking_users.includes(member.user_id)
        )
      : newMemberList;

    setMemberListView([...memberListView, ...filteredMemberList]);
    setMemberListOffset(memberListOffset + memberListPageSize);
  };

  const isOtherMember = (member: MemberWithProfiles) => {
    if (myMember) {
      return (
        member.user_id != myMember.user_id &&
        !myMember.profiles.blocking_users.includes(member.user_id as string)
      );
    }
    return true;
  };

  if (!memberCount || !memberListView) {
    return (
      <div className="flex flex-col pb-10">
        <div className="text-sm text-gray-500 py-2">
          <div className="mb-2">그룹원 기도카드</div>
        </div>
        <div className="flex flex-col pb-10 gap-4">
          <Skeleton className="w-full rounded-2xl h-32 bg-gray-200" />
          <Skeleton className="w-full rounded-2xl h-32 bg-gray-200" />
          <Skeleton className="w-full rounded-2xl h-32 bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-10">
      <div className="text-sm text-gray-500 py-2">
        <div className="mb-2">그룹원 기도카드</div>
      </div>

      <div className="flex flex-col gap-4 pb-20">
        {groupList?.length == 1 &&
          (memberCount == 1 ? <InviteBanner /> : <RewardBanner />)}
        {memberCount == 1 && (
          <>
            <DummyOtherMember />
            <InviteOtherMember />
          </>
        )}

        {memberListView.map(
          (member) =>
            isOtherMember(member) && (
              <OtherMember key={member.id} member={member}></OtherMember>
            )
        )}

        {memberCount && memberListOffset < memberCount && (
          <div className="flex justify-center">
            <ShowMoreBtn
              onClick={onClickMoreMemberList}
              isLoading={!memberList}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OtherMemberList;
