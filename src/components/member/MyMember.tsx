import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import useBaseStore from "@/stores/baseStore";
import { useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import MyPrayCardUI from "../prayCard/MyPrayCardUI";
import { analyticsTrack } from "@/analytics/analytics";

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
  const isOpenMyMemberDrawer = useBaseStore(
    (state) => state.isOpenMyMemberDrawer
  );
  const setIsOpenMyMemberDrawer = useBaseStore(
    (state) => state.setIsOpenMyMemberDrawer
  );
  const setIsOpenMyPrayDrawer = useBaseStore(
    (state) => state.setIsOpenMyPrayDrawer
  );

  const onClickMyMemberReaction = () => {
    analyticsTrack("클릭_멤버_본인반응", {
      group_id: groupId,
      where: "MyMember",
    });
  };

  const handleClick = () => {
    setIsOpenMyMemberDrawer(true);
    setIsOpenMyPrayDrawer(true);
    onClickMyMemberReaction();
  };

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

  const prayCard = userPrayCardList[0];
  const prayDatasForMe = prayCard.pray;

  const MyMemberUI = (
    <div className="w-full flex flex-col gap-3 cursor-pointer bg-white p-[25px] rounded-[15px] shadow-member">
      <div className="flex flex-col gap-1">
        <h3 className="flex font-bold text-lg">내 기도제목</h3>
        <div className="text-left text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
          {inputPrayCardContent}
        </div>
      </div>

      <div className="flex">
        <div
          className="w-fit flex bg-gray-100 rounded-lg px-4 py-2 gap-[18px]"
          onClick={() => handleClick()}
        >
          {Object.values(PrayType).map((type) => {
            return (
              <div key={type} className="flex items-center gap-1 ">
                <img
                  src={PrayTypeDatas[type].img}
                  alt={PrayTypeDatas[type].emoji}
                  className="w-4 h-4 opacity-90"
                />
                <p className="text-sm text-dark">
                  {
                    prayDatasForMe?.filter((pray) => pray.pray_type === type)
                      .length
                  }
                </p>
              </div>
            );
          })}
        </div>
        {prayDatasForMe && prayDatasForMe.length > 0 && (
          <p className=" flex items-center text-gray-500 text-[8px] p-2">
            누군가 내게 기도했어요 😊
          </p>
        )}
      </div>
    </div>
  );

  const onClickMyMember = () => {
    analyticsTrack("클릭_멤버_본인", {
      group_id: groupId,
      where: "MyMember",
    });
  };

  return (
    <Drawer open={isOpenMyMemberDrawer} onOpenChange={setIsOpenMyMemberDrawer}>
      <DrawerTrigger
        className="focus:outline-none"
        onClick={() => onClickMyMember()}
      >
        <div className="flex flex-col items-start gap-2">{MyMemberUI}</div>
      </DrawerTrigger>

      <DrawerContent className="bg-mainBg max-w-[480px] mx-auto w-full px-10 pb-20 focus:outline-none">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        {/* PrayCard */}
        <MyPrayCardUI member={member} prayCard={prayCard} />
        {/* PrayCard */}
      </DrawerContent>
    </Drawer>
  );
};

export default MyMember;
