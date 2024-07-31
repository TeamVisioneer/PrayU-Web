import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useBaseStore from "@/stores/baseStore";
import useAuth from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "../components/ui/use-toast";
import { ClipLoader } from "react-spinners";

const GroupCreatePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
  const groupList = useBaseStore((state) => state.groupList);
  const maxGroupCount = Number(import.meta.env.VITE_MAX_GROUP_COUNT);
  const fetchGroupListByUserId = useBaseStore(
    (state) => state.fetchGroupListByUserId
  );

  const handleCreateGroup = async (
    userId: string | undefined,
    inputGroupName: string
  ) => {
    if (groupList!.length == maxGroupCount) {
      toast({
        description: `최대 ${maxGroupCount}개의 그룹만 참여할 수 있어요`,
      });
      return;
    }
    setIsDisabledGroupCreateBtn(true);
    const targetGroup = await createGroup(userId, inputGroupName, "intro");
    targetGroup && navigate("/group/" + targetGroup.id, { replace: true });
  };

  useEffect(() => {
    fetchGroupListByUserId(user!.id);
    setGroupName("");
  }, [fetchGroupListByUserId, user, setGroupName]);

  if (!groupList) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 items-center">
      <div className="text-lg font-bold">PrayU 그룹 생성</div>

      <div className="flex justify-center h-[300px] w-max">
        <img
          className="h-full object-cover"
          src="https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/PrayCardListLarge.png"
        />
      </div>
      <div className="flex flex-col items-center gap-4 w-full ">
        <Input
          type="text"
          value={inputGroupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="그룹 이름을 입력해주세요"
          maxLength={15}
        />
        <Button
          onClick={() => handleCreateGroup(user?.id, inputGroupName)}
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
            그룹장에게 초대링크를 요청해 주세요
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroupCreatePage;
