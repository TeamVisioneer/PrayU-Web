import { useState, useEffect } from "react";
import arcCard from "@/assets/bibleCard/arcCard.png";
import { cn } from "@/lib/utils";

interface BibleCardCarouselProps {
  className?: string;
}

const BibleCardCarousel: React.FC<BibleCardCarouselProps> = ({ className }) => {
  const images = [arcCard, arcCard, arcCard, arcCard];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div
      className={cn(
        className,
        "relative w-full max-w-3xl mx-auto overflow-hidden rounded-lg shadow-lg"
      )}
    >
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        aria-live="polite"
      >
        {images.map((src, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <img src={src} className="w-full aspect-[4/6]" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BibleCardCarousel;
