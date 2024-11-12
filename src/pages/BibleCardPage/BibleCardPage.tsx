import { Button } from "@/components/ui/button";
import MainHeader from "../MainPage/MainHeader";
import BibleCardFlip from "./BibleCardFlip";
import BibleCardIntro from "./BibleCardIntro";
import { useRef } from "react";
import { analyticsTrack } from "@/analytics/analytics";

const BibleCardPage = () => {
  const firstSectionRef = useRef<HTMLElement | null>(null);
  const secondSectionRef = useRef<HTMLElement | null>(null);

  const scrollToSecondSection = () => {
    analyticsTrack("클릭_말씀카드_시작", {});
    secondSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center snap-y snap-mandatory overflow-y-auto no-scrollbar">
      <MainHeader />
      <section
        ref={firstSectionRef}
        className="w-full min-h-screen snap-start flex flex-col justify-center items-center px-10 gap-5"
      >
        <BibleCardIntro />
        <Button
          className="w-5/6"
          variant="primary"
          onClick={() => scrollToSecondSection()}
        >
          시작하기
        </Button>
      </section>
      <section
        ref={secondSectionRef}
        className="w-full min-h-screen snap-start flex flex-col justify-center items-center pt-14"
      >
        <BibleCardFlip />
      </section>
    </div>
  );
};

export default BibleCardPage;
