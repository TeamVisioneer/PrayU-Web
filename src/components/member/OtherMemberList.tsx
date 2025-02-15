import OtherMember from "./OtherMember";
import TodayPrayBtn from "../todayPray/TodayPrayBtn";
import DummyOtherMember from "./DummyOtherMember";
import InviteBanner from "../notice/InviteBanner";
import RewardBanner from "../notice/RewardBanner";
import useBaseStore from "@/stores/baseStore";
import { useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { MemberWithProfiles } from "supabase/types/tables";
import useRealtimeMember from "./useRealtimeMember";

const OtherMemberList: React.FC = () => {
  const myMember = useBaseStore((state) => state.myMember);
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const groupList = useBaseStore((state) => state.groupList);
  const memberList = useBaseStore((state) => state.memberList);
  const memberListView = useBaseStore((state) => state.memberListView);
  const fetchMemberListByGroupId = useBaseStore(
    (state) => state.fetchMemberListByGroupId
  );
  const setMemberList = useBaseStore((state) => state.setMemberList);
  const setMemberListView = useBaseStore((state) => state.setMemberListView);
  const memberCount = useBaseStore((state) => state.memberCount);
  const pageSize = 25;
  const [offset, setOffset] = useState(pageSize);

  useEffect(() => {
    if (memberList && memberListView.length == 0)
      setMemberListView([...memberList]);
  }, [memberList, memberListView, setMemberListView]);

  useRealtimeMember(targetGroup!.id, async () => {
    const memberList = await fetchMemberListByGroupId(targetGroup!.id);
    if (!memberList) return;
    setMemberListView([...memberListView, ...memberList]);
  });

  if (!targetGroup || !memberCount) return;

  const onClickMoreMemberList = async () => {
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

  return (
    <div className="flex flex-col gap-2 pb-10">
      <div className="text-sm text-gray-500 p-2">기도 구성원</div>
      <div className="flex flex-col gap-4 pb-20">
        {groupList?.length == 1 &&
          (memberCount == 1 ? <InviteBanner /> : <RewardBanner />)}
        {memberCount == 1 && <DummyOtherMember />}

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

      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2">
        <TodayPrayBtn
          eventOption={{
            where: "OtherMemberList",
            total_member: memberCount,
          }}
        />
      </div>
    </div>
  );
};

export default OtherMemberList;
