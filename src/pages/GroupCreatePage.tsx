import React, { useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import useAuth from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "../components/ui/use-toast";
import { ClipLoader } from "react-spinners";
import { analyticsTrack } from "@/analytics/analytics";
import { IoChevronBack } from "react-icons/io5";
import GroupMenuBtn from "@/components/group/GroupMenuBtn";

const GroupCreatePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const createGroup = useBaseStore((state) => state.createGroup);
  const inputGroupName = useBaseStore((state) => state.inputGroupName);
  const setGroupName = useBaseStore((state) => state.setGroupName);
  const isDisabledGroupCreateBtn = useBaseStore(
    (state) => state.isDisabledGroupCreateBtn
  );
  const setIsDisabledGroupCreateBtn = useBaseStore(
    (state) => state.setIsDisabledGroupCreateBtn
  );
  const createMember = useBaseStore((state) => state.createMember);
  const createPrayCard = useBaseStore((state) => state.createPrayCard);
  const groupList = useBaseStore((state) => state.groupList);
  const maxGroupCount = Number(import.meta.env.VITE_MAX_GROUP_COUNT);
  const fetchGroupListByUserId = useBaseStore(
    (state) => state.fetchGroupListByUserId
  );
  const userPlan = useBaseStore((state) => state.userPlan);

  useEffect(() => {
    fetchGroupListByUserId(user!.id);
    setGroupName("");
  }, [fetchGroupListByUserId, user, setGroupName]);

  if (!groupList) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={20} color={"#70AAFF"} loading={true} />
      </div>
    );
  }

  const handleCreateGroup = async (userId: string, inputGroupName: string) => {
    if (groupList.length >= maxGroupCount && userPlan != "Premium") {
      toast({
        description: `최대 ${maxGroupCount}개의 그룹만 참여할 수 있어요`,
      });
      return;
    }
    setIsDisabledGroupCreateBtn(true);
    analyticsTrack("클릭_그룹_생성", { group_name: inputGroupName });
    const targetGroup = await createGroup(userId, inputGroupName, "intro");
    if (!targetGroup) {
      setIsDisabledGroupCreateBtn(false);
      return;
    }
    const myMember = await createMember(targetGroup.id, userId, "");
    if (!myMember) {
      setIsDisabledGroupCreateBtn(false);
      return;
    }
    await createPrayCard(targetGroup.id, userId, "");

    window.location.replace(`/group/${targetGroup.id}`);
  };

  return (
    <div className="flex flex-col gap-6 items-center">
      <div className="w-full flex justify-between items-center">
        <IoChevronBack size={20} onClick={() => window.history.back()} />
        <span className="text-xl font-bold">그룹 만들기</span>
        <GroupMenuBtn userGroupList={groupList} />
      </div>
      <div className="flex justify-center h-[300px] w-max">
        <img className="h-full object-cover" src="/images/intro_square.png" />
      </div>
      <div className="flex flex-col items-center gap-4 w-full ">
        <Input
          type="text"
          value={inputGroupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="그룹 이름을 입력해 주세요"
          maxLength={12}
        />
        <Button
          onClick={() => handleCreateGroup(user!.id, inputGroupName)}
          className="w-full"
          disabled={isDisabledGroupCreateBtn}
          variant="primary"
        >
          그룹 생성하기
        </Button>
        <div className="text-center">
          <p className="text-xs text-gray-500">
            기존 그룹에 참여하고 싶은 경우
          </p>
          <p className="text-xs text-gray-500">
            그룹장에게 초대 링크를 요청해 보아요
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroupCreatePage;
