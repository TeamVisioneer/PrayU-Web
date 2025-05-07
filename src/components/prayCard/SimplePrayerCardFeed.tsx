import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { PrayCardWithProfiles } from "supabase/types/tables";
import PrayCard from "./PrayCard";
interface SimplePrayerCardFeedProps {
  prayerCards: PrayCardWithProfiles[] | null;
  onCardChange?: (selectedCard: PrayCardWithProfiles | null) => void;
}

// 기도카드 캐러셀 컴포넌트 - 모바일 화면에서 카드를 스와이프할 수 있는 기능 제공
export const SimplePrayerCardCarousel: React.FC<SimplePrayerCardFeedProps> = ({
  prayerCards,
  onCardChange,
}) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    carouselApi?.on("select", () => {
      const index = carouselApi.selectedScrollSnap();
      const carouselLength = carouselApi.scrollSnapList().length;
      if (index === 0) carouselApi.scrollNext();
      if (index === carouselLength - 1) {
        carouselApi.scrollPrev();
      }

      // Update parent component with selected card
      if (onCardChange && prayerCards && prayerCards.length > 0) {
        // Adjust index for edge slides
        const adjustedIndex = index - 1;
        if (adjustedIndex >= 0 && adjustedIndex < prayerCards.length) {
          onCardChange(prayerCards[adjustedIndex]);
        }
      }
    });
  }, [carouselApi, prayerCards, onCardChange]);

  return (
    <div className="w-full">
      {/* <h2 className="w-full text-lg font-medium text-gray-900 mb-4 text-center">
        이번 주 기도카드
      </h2> */}

      <Carousel
        className="w-full"
        opts={{ startIndex: 1 }}
        setApi={setCarouselApi}
      >
        <CarouselContent className="py-4">
          <CarouselItem className="basis-3/4" />

          {prayerCards == null ? (
            <CarouselItem className="basis-3/4">
              <PrayCard prayCard={undefined} />
            </CarouselItem>
          ) : prayerCards.length === 0 ? (
            <CarouselItem className="basis-3/4">
              <div className="aspect-[3/4] flex flex-col items-center justify-center">
                <p className="text-gray-500">
                  이번 주 등록된 기도카드가 없습니다😭
                </p>
                <p className="text-gray-500">
                  오늘 기도카드 등록을 요청해주세요!
                </p>
              </div>
            </CarouselItem>
          ) : (
            prayerCards.map((card) => (
              <CarouselItem key={card.id} className="basis-3/4">
                <PrayCard prayCard={card} />
              </CarouselItem>
            ))
          )}

          <CarouselItem className="basis-3/4" />
        </CarouselContent>
      </Carousel>
    </div>
  );
};
