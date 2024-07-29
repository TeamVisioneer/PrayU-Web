import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useBaseStore from "@/stores/baseStore";
import useAuth from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "../components/ui/use-toast";
import { ClipLoader } from "react-spinners";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const GroupCreatePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const createGroup = useBaseStore((state) => state.createGroup);
  const inputGroupName = useBaseStore((state) => state.inputGroupName);
  const setGroupName = useBaseStore((state) => state.setGroupName);
  const groupList = useBaseStore((state) => state.groupList);
  const maxGroupCount = Number(import.meta.env.VITE_MAX_GROUP_COUNT);

  const fetchGroupListByUserId = useBaseStore(
    (state) => state.fetchGroupListByUserId
  );

  useEffect(() => {
    fetchGroupListByUserId(user!.id);
  }, [fetchGroupListByUserId, user]);

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
    if (inputGroupName.trim() === "") {
      toast({
        description: "그룹 이름을 입력해주세요.",
      });
      return;
    }
    const targetGroup = await createGroup(userId, inputGroupName, "intro");
    targetGroup && navigate("/group/" + targetGroup.id, { replace: true });
  };

  if (!groupList) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="text-lg font-bold">PrayU 그룹 생성</div>
      </div>

      <Carousel>
        <CarouselContent className="aspect-square">
          <CarouselItem>
            <img src="https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/todayPray.png?t=2024-07-28T04%3A12%3A49.623Z" />
          </CarouselItem>
        </CarouselContent>
      </Carousel>

      <div className="text-sm font-bold">그룹명</div>
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
        >
          그룹 생성하기
        </Button>
        <div className="text-xs text-gray-500">
          기존 그룹에 참여하고 싶은 경우 그룹장에게 초대링크를 요청해 주세요
        </div>
      </div>
    </div>
  );
};

export default GroupCreatePage;
