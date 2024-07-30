import { getISOTodayDate, reduceString } from "../../lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import PrayCardUI from "../prayCard/PrayCardUI";
import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";
import { ClipLoader } from "react-spinners";
import PrayCardCreateModal from "../prayCard/PrayCardCreateModal";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";

interface MemberProps {
  currentUserId: string;
  groupId: string | undefined;
}

const MyMember: React.FC<MemberProps> = ({ currentUserId, groupId }) => {
  const member = useBaseStore((state) => state.targetMember);
  const memberLoading = useBaseStore((state) => state.memberLoading);
  const getMember = useBaseStore((state) => state.getMember);
  const fetchUserPrayCardListByGroupId = useBaseStore(
    (state) => state.fetchUserPrayCardListByGroupId
  );
  const userPrayCardList = useBaseStore((state) => state.userPrayCardList);
  const setPrayCardContent = useBaseStore((state) => state.setPrayCardContent);
  const inputPrayCardContent = useBaseStore(
    (state) => state.inputPrayCardContent
  );

  useEffect(() => {
    getMember(currentUserId, groupId);
    fetchUserPrayCardListByGroupId(currentUserId, groupId);
  }, [currentUserId, fetchUserPrayCardListByGroupId, getMember, groupId]);

  useEffect(() => {
    setPrayCardContent(member?.pray_summary || "");
  }, [member, setPrayCardContent]);

  if (memberLoading || !userPrayCardList) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  if (
    member == null ||
    userPrayCardList.length === 0 ||
    userPrayCardList[0].created_at < getISOTodayDate(-6)
  ) {
    return (
      <PrayCardCreateModal
        currentUserId={currentUserId}
        groupId={groupId}
        member={member}
      />
    );
  }

  const prayCard = userPrayCardList[0];
  const prayDatasForMe = prayCard.pray;

  const MyMemberUI = (
    <div className="w-full flex flex-col gap-2 cursor-pointer bg-white p-4 rounded-2xl shadow-md">
      <div className="flex">
        <h3 className="font-bold">내 기도제목</h3>
      </div>
      <div className="text-left text-sm text-gray-600">
        {reduceString(inputPrayCardContent, 20)}
      </div>
      <div className="w-fit flex bg-gray-100 rounded-lg p-2">
        {Object.values(PrayType).map((type) => {
          return (
            <div key={type} className={`w-[40px] flex gap-1`}>
              <div className="flex justify-center items-center gap-1 ">
                <img
                  src={PrayTypeDatas[type].img}
                  alt={PrayTypeDatas[type].emoji}
                  className="w-4 h-4 opacity-90"
                />
                <p className="text-xs text-gray-600">
                  {
                    prayDatasForMe?.filter((pray) => pray.pray_type === type)
                      .length
                  }
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Drawer>
      <DrawerTrigger className="focus:outline-none">
        <div className="flex flex-col items-start gap-2">{MyMemberUI}</div>
      </DrawerTrigger>

      <DrawerContent className="bg-mainBg max-w-[480px] mx-auto w-full h-[90%] px-10 pb-20 focus:outline-none">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        {/* PrayCard */}
        <PrayCardUI
          currentUserId={currentUserId}
          member={member}
          prayCard={prayCard}
        />
        {/* PrayCard */}
      </DrawerContent>
    </Drawer>
  );
};

export default MyMember;
