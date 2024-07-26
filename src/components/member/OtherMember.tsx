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
import { getDateDistance, getDateDistanceText } from "@toss/date";

interface OtherMemberProps {
  currentUserId: string;
  member: MemberWithProfiles;
  prayCardList: PrayCardWithProfiles[];
}

const OtherMember: React.FC<OtherMemberProps> = ({
  currentUserId,
  member,
  prayCardList,
}) => {
  const prayCard = prayCardList[0] || null;

  const dateDistance = getDateDistance(
    new Date(getISOOnlyDate(member?.updated_at ?? null)),
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

  const memberUI = (
    <div className="flex flex-col gap-2 cursor-pointer bg-blue-100 p-4 rounded ">
      <div className="flex items-center gap-2">
        <img
          src={member.profiles.avatar_url || ""}
          className="w-5 h-5 rounded-full"
        />
        <h3>{member.profiles.full_name}</h3>
      </div>
      <div className="text-left text-sm text-gray-600">
        {reduceString(member.pray_summary, 20)}
      </div>
      <div className="text-gray-400 text-left text-xs">{dateDistanceText}</div>
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

export default OtherMember;
