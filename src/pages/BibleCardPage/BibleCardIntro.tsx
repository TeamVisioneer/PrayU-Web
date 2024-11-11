import { cn } from "@/lib/utils";
import BibleCardCarousel from "./BibleCardCarousel";

interface BibleCardIntroProps {
  className?: string;
}

const BibleCardIntro: React.FC<BibleCardIntroProps> = ({ className }) => {
  return (
    <div
      className={cn(
        className,
        "w-full flex flex-col text-center justify-center items-center gap-5 "
      )}
    >
      <BibleCardCarousel />
      <section className="flex flex-col gap-1">
        <h1 className="font-semibold text-3xl">PrayU 말씀카드</h1>
        <p className="font-light">
          <p>내 기도제목에 맞는 말씀 구절을 추천받고,</p>
          <p>나만의 말씀카드로 만들어 보아요 </p>
        </p>
      </section>
    </div>
  );
};

export default BibleCardIntro;
