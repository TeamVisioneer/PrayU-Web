import { MemberWithProfiles, PrayCard } from "supabase/types/tables";
import { formatDateString } from "../../lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "../ui/button";
import PrayCardUI from "../prayCard/PrayCardUI";

interface MemberProps {
  member: MemberWithProfiles | undefined;
  prayCardList: PrayCard[];
}

const Member: React.FC<MemberProps> = ({ member, prayCardList }) => {
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
        {formatDateString(prayCard?.updated_at)}
      </div>
    </div>
  );

  return (
    <Drawer>
      <DrawerTrigger>{memberUI}</DrawerTrigger>
      <DrawerContent className="max-w-[480px] mx-auto w-full h-[90%] px-10">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        {/* PrayCard 내용추가 */}
        <PrayCardUI member={member} prayCard={prayCard} />

        {/* PrayCard 내용추가 */}
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default Member;
