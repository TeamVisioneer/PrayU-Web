import React, { useEffect } from "react";
import useBaseStore from "@/stores/baseStore";
import useAuth from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "../components/ui/use-toast";
import { analyticsTrack } from "@/analytics/analytics";
import { IoChevronBack } from "react-icons/io5";
import GroupMenuBtn from "@/components/group/GroupMenuBtn";
import PrayUSquareImage from "@/assets/prayu_square.png";
import GroupListDrawer from "@/components/group/GroupListDrawer";
import { PulseLoader } from "react-spinners";

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
  const maxGroupCount = Number(import.meta.env.VITE_MAX_GROUP_COUNT);
  const fetchGroupListByUserId = useBaseStore(
    (state) => state.fetchGroupListByUserId
  );

  const userPlan = useBaseStore((state) => state.userPlan);

  useEffect(() => {
    setGroupName("");
  }, [user, setGroupName]);

  const handleCreateGroup = async (userId: string, inputGroupName: string) => {
    const groupList = await fetchGroupListByUserId(userId);
    if (!groupList) return;
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
    <div className="flex flex-col gap-6 items-center p-5">
      <div className="w-full flex justify-between items-center">
        <IoChevronBack size={20} onClick={() => window.history.back()} />
        <span className="text-xl font-bold">그룹 만들기</span>
        <GroupMenuBtn />
      </div>
      <div className="w-full aspect-square flex justify-center">
        <img
          className="h-full object-cover rounded-lg"
          src={PrayUSquareImage}
        />
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
          {isDisabledGroupCreateBtn && inputGroupName ? (
            <PulseLoader size={10} color="#f3f4f6" />
          ) : (
            "그룹 생성하기"
          )}
        </Button>
        <div className="text-center">
          <p className="text-xs text-gray-500">
            기존 그룹에 참여하고 싶은 경우
          </p>
          <p className="text-xs text-gray-500">
            그룹장에게 초대 링크를 요청해 주세요
          </p>
        </div>
      </div>
      <GroupListDrawer />
    </div>
  );
};

export default GroupCreatePage;
