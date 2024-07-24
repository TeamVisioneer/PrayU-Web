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
  const prayCardCarouselApi = useBaseStore(
    (state) => state.prayCardCarouselApi
  );
  const setPrayCardCarouselApi = useBaseStore(
    (state) => state.setPrayCardCarouselApi
  );

  useEffect(() => {
    if (!prayCardCarouselApi) {
      return;
    }
    prayCardCarouselApi.on("select", () => {
      if (prayCardCarouselApi.selectedScrollSnap() == 0) {
        prayCardCarouselApi.scrollNext();
      }
      if (
        prayCardCarouselApi.selectedScrollSnap() ==
        prayCardCarouselApi.scrollSnapList().length - 1
      ) {
        prayCardCarouselApi.scrollPrev();
      }
    });
  }, [prayCardCarouselApi]);

  return (
    <Carousel
      setApi={setPrayCardCarouselApi}
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
