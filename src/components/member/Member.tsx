import { MemberWithProfiles, PrayCard } from "supabase/types/tables";
import { getISODate } from "../../lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import PrayCardUI from "../prayCard/PrayCardUI";

interface MemberProps {
  currentUserId: string | undefined;
  member: MemberWithProfiles | undefined;
  prayCardList: PrayCard[];
}

const Member: React.FC<MemberProps> = ({
  currentUserId,
  member,
  prayCardList,
}) => {
  const prayCard = prayCardList[0] || null;

  const memberUI = (
    <div className="flex flex-col gap-2 cursor-pointer bg-gray-600 p-4 rounded ">
      <div className="flex items-center">
        <img
          src={member?.profiles.avatar_url || ""}
          alt={`${member?.profiles.full_name}'s avatar`}
          className="w-5 h-5 rounded-full mr-4"
        />
        <h3 className="text-white">{member?.profiles.full_name}</h3>
      </div>
      <div className="text-left text-sm text-gray-300">
        {prayCard?.content || "아직 기도제목이 없어요"}
      </div>
      <div className="text-gray-500 text-left text-sm">
        {getISODate(prayCard?.updated_at).split("T")[0]}
      </div>
    </div>
  );

  return (
    <Drawer>
      <DrawerTrigger>{memberUI}</DrawerTrigger>
      <DrawerContent className="max-w-[480px] mx-auto w-full h-[90%] px-10 pb-20">
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

export default Member;
