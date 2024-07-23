import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import useBaseStore from "@/stores/baseStore";
import PrayCardUI from "./PrayCardUI";
import { useEffect } from "react";

interface PrayCardListProps {
  currentUserId: string | undefined;
}

// TODO: PrayData 한번에 가져와서 미리 렌더링 할 수 있도록 수정
const PrayCardList: React.FC<PrayCardListProps> = ({ currentUserId }) => {
  const groupPrayCardList = useBaseStore((state) => state.groupPrayCardList);
  const carouselApi = useBaseStore((state) => state.carouselApi);
  const setCarouselApi = useBaseStore((state) => state.setCarouselApi);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }
    carouselApi.on("select", () => {
      if (carouselApi.selectedScrollSnap() == 0) {
        carouselApi.scrollNext();
      }
      if (
        carouselApi.selectedScrollSnap() ==
        carouselApi.scrollSnapList().length - 1
      ) {
        carouselApi.scrollPrev();
      }
    });
  }, [carouselApi]);

  return (
    <Carousel
      setApi={setCarouselApi}
      opts={{
        startIndex: 1,
      }}
    >
      <CarouselContent>
        <CarouselItem className="basis-5/6 "></CarouselItem>
        {groupPrayCardList
          ?.filter((prayCard) => prayCard.user_id != currentUserId)
          .map((prayCard) => (
            <CarouselItem key={prayCard.id} className="basis-5/6">
              <PrayCardUI currentUserId={currentUserId} prayCard={prayCard} />
            </CarouselItem>
          ))}
        <CarouselItem className="basis-5/6 "></CarouselItem>
      </CarouselContent>
    </Carousel>
  );
};

export default PrayCardList;
