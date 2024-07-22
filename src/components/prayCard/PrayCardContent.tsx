import React from "react";
import {
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import PrayCardList from "./PrayCardList";

interface MemberProps {
  currentUserId: string | undefined;
}

const PrayCardContent: React.FC<MemberProps> = ({ currentUserId }) => {
  return (
    <DrawerContent className="max-w-[480px] mx-auto w-full h-[90%] pb-20">
      <DrawerHeader>
        <DrawerTitle></DrawerTitle>
        <DrawerDescription></DrawerDescription>
      </DrawerHeader>
      {/* PrayCardList */}
      <PrayCardList currentUserId={currentUserId} />
      {/* PrayCardList */}
    </DrawerContent>
  );
};

export default PrayCardContent;
