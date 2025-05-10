import OtherMember from "./OtherMember";
import DummyOtherMember from "./DummyOtherMember";
import InviteBanner from "../notice/InviteBanner";
import RewardBanner from "../notice/RewardBanner";
import useBaseStore from "@/stores/baseStore";
import { useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { MemberWithProfiles } from "supabase/types/tables";
import useRealtimeMember from "./useRealtimeMember";
import InviteOtherMember from "./InviteOtherMember";
import { Skeleton } from "../ui/skeleton";

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
  const pageSize = 25;
  const [offset, setOffset] = useState(pageSize);

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
    if (memberList && memberListView.length == 0)
      setMemberListView([...memberList]);
  }, [memberList, memberListView, setMemberListView]);

  const onClickMoreMemberList = async () => {
    if (!targetGroup || !memberCount) return;
    if (offset >= memberCount) return;

    setMemberList(null);
    const limit = offset > memberCount ? memberCount - offset : pageSize;
    const newMemberList = await fetchMemberListByGroupId(
      targetGroup.id,
      limit,
      offset
    );
    if (!memberList || !newMemberList) return;

    setMemberListView([...memberListView, ...newMemberList]);
    setOffset(offset + pageSize);
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

        {offset < memberCount && (
          <div
            onClick={() => onClickMoreMemberList()}
            className="w-full flex justify-center items-center"
          >
            {memberList ? (
              <span className="text-gray-500 underline ">더보기</span>
            ) : (
              <ClipLoader color="#70AAFF" size={10} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OtherMemberList;
