import { Button } from "@/components/ui/button";
import MainHeader from "../MainPage/MainHeader";
import BibleCardFlip from "./BibleCardFlip";
import BibleCardIntro from "./BibleCardIntro";
import { useRef } from "react";

const BibleCardPage = () => {
  const firstSectionRef = useRef<HTMLElement | null>(null);
  const secondSectionRef = useRef<HTMLElement | null>(null);

  const scrollToSecondSection = () => {
    secondSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center snap-y snap-mandatory overflow-y-auto no-scrollbar scroll-smooth">
      <MainHeader />
      <section
        ref={firstSectionRef}
        className="w-full min-h-screen snap-start flex flex-col justify-center items-center p-10 gap-5"
      >
        <BibleCardIntro />
        <Button
          className="w-full"
          variant="primary"
          onClick={() => scrollToSecondSection()}
        >
          시작하기
        </Button>
      </section>
      <section
        ref={secondSectionRef}
        className="w-full min-h-screen snap-start flex flex-col justify-center items-center"
      >
        <BibleCardFlip />
      </section>
    </div>
  );
};

export default BibleCardPage;
