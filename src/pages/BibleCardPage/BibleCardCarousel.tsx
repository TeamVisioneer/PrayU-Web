import { useState, useEffect } from "react";
import Card1 from "@/assets/bibleCard/Card1.jpeg";
import Card2 from "@/assets/bibleCard/Card2.jpeg";
import Card3 from "@/assets/bibleCard/Card3.jpeg";
import Card4 from "@/assets/bibleCard/Card4.jpeg";

const BibleCardCarousel: React.FC = () => {
  const images = [Card1, Card2, Card3, Card4];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="w-5/6 overflow-hidden rounded-lg shadow-lg">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        aria-live="polite"
      >
        {images.map((src, index) => (
          <img key={index} src={src} className="w-full" />
        ))}
      </div>
    </div>
  );
};

export default BibleCardCarousel;
