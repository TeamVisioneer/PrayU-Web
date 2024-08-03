import {
  MemberWithProfiles,
  PrayCardWithProfiles,
} from "supabase/types/tables";
import { getISOOnlyDate, getISOTodayDate } from "../../lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import PrayCardUI from "../prayCard/PrayCardUI";
import { getDateDistance } from "@toss/date";
import { analyticsTrack } from "@/analytics/analytics";

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

  const onClickOtherMember = () => {
    analyticsTrack("클릭_멤버_구성원", { member: member.user_id });
  };

  const memberUI = (
    <div className="flex flex-col gap-[10px] cursor-pointer bg-white p-5 rounded-2xl shadow-member">
      <div className="flex items-center gap-2">
        <img
          src={member.profiles.avatar_url || ""}
          className="w-8 h-8 rounded-full"
        />
        <h3>{member.profiles.full_name}</h3>
      </div>
      <div className="text-left text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis w-full block">
        {member.pray_summary}
      </div>
      <div className="text-gray-400 text-left text-xs">
        {dateDistance.days < 1 ? "오늘" : `${dateDistance.days}일 전`}
      </div>
    </div>
  );

  return (
    <Drawer>
      <DrawerTrigger
        className="focus:outline-none"
        onClick={() => onClickOtherMember()}
      >
        {memberUI}
      </DrawerTrigger>
      <DrawerContent className="bg-mainBg max-w-[480px] mx-auto w-full px-10 pb-10 focus:outline-none">
        <DrawerHeader className="p-2">
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        {/* PrayCard */}
        <PrayCardUI
          currentUserId={currentUserId}
          member={member}
          prayCard={prayCard}
          eventOption={{ where: "OtherMember" }}
        />
        {/* PrayCard */}
      </DrawerContent>
    </Drawer>
  );
};

export default OtherMember;
