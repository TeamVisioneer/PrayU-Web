import {
  MemberWithProfiles,
  PrayCardWithProfiles,
} from "supabase/types/tables";
import { getISOOnlyDate, getISOTodayDate, reduceString } from "../../lib/utils";
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
import { getDateDistance, getDateDistanceText } from "@toss/date";

interface MemberProps {
  currentUserId: string;
  member: MemberWithProfiles | undefined;
  prayCardList: PrayCardWithProfiles[];
}

const Member: React.FC<MemberProps> = ({
  currentUserId,
  member,
  prayCardList,
}) => {
  const prayCard = prayCardList[0] || null;
  const myPrayerContent = useBaseStore((state) => state.myPrayerContent);
  const setMyPrayerContent = useBaseStore((state) => state.setMyPrayerContent);

  const dateDistance = getDateDistance(
    new Date(getISOOnlyDate(prayCard?.created_at)),
    new Date(getISOTodayDate())
  );

  let dateDistanceText = getDateDistanceText(dateDistance, {
    days: (t) => 1 <= t.days,
    hours: () => false,
    minutes: () => false,
    seconds: () => false,
  });

  if (dateDistance.days < 1) {
    dateDistanceText = "오늘";
  }

  useEffect(() => {
    if (currentUserId == member?.user_id)
      setMyPrayerContent(prayCard?.content || "");
  }, [prayCard?.content, setMyPrayerContent, currentUserId, member?.user_id]);

  const memberUI = (
    <div className="flex flex-col gap-2 cursor-pointer bg-blue-100 p-4 rounded ">
      <div className="flex items-center gap-2">
        <img
          src={member?.profiles.avatar_url || ""}
          alt={`${member?.profiles.full_name}'s avatar`}
          className="w-5 h-5 rounded-full"
        />
        <h3>{member?.profiles.full_name}</h3>
      </div>
      <div className="text-left text-sm text-gray-600">
        {currentUserId != member?.user_id
          ? prayCard?.content
            ? reduceString(prayCard.content, 20)
            : "아직 기도제목이 없어요"
          : myPrayerContent
          ? reduceString(myPrayerContent, 20)
          : "아직 기도제목이 없어요"}
      </div>
      <div className="text-gray-400 text-left text-xs">
        {/*getISODate(prayCard?.updated_at).split("T")[0]*/ dateDistanceText}
      </div>
    </div>
  );

  return (
    <Drawer>
      <DrawerTrigger className="focus:outline-none">{memberUI}</DrawerTrigger>
      <DrawerContent className="max-w-[480px] mx-auto w-full h-[90%] px-10 pb-20 focus:outline-none">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        {/* PrayCard */}
        <PrayCardUI currentUserId={currentUserId} prayCard={prayCard} />
        {/* PrayCard */}
      </DrawerContent>
    </Drawer>
  );
};

export default Member;
