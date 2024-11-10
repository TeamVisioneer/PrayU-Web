import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import BibleCard1 from "@/assets/bibleCard/BibleCard1.jpeg";
import BibleCard2 from "@/assets/bibleCard/BibleCard2.jpeg";
import BibleCard3 from "@/assets/bibleCard/BibleCard3.jpeg";
import BibleCard4 from "@/assets/bibleCard/BibleCard4.jpeg";

interface BibleCardCarouselProps {
  className?: string;
}

const BibleCardCarousel: React.FC<BibleCardCarouselProps> = ({ className }) => {
  const images = [BibleCard1, BibleCard2, BibleCard3, BibleCard4];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div
      className={cn(className, "relative w-full overflow-hidden rounded-lg")}
    >
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        aria-live="polite"
      >
        {images.map((src, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <img src={src} className="w-full aspect-[4/6] border" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BibleCardCarousel;
