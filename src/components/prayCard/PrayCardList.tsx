import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import useBaseStore from "@/stores/baseStore";
import PrayCardUI from "./PrayCardUI";
import { useEffect } from "react";

interface PrayCardListProps {
  currentUserId: string;
  groupId: string | undefined;
}

const PrayCardList: React.FC<PrayCardListProps> = ({
  currentUserId,
  groupId,
}) => {
  const groupPrayCardList = useBaseStore((state) => state.groupPrayCardList);
  const fetchPrayCardListByGroupId = useBaseStore(
    (state) => state.fetchPrayCardListByGroupId
  );
  const prayCardCarouselApi = useBaseStore(
    (state) => state.prayCardCarouselApi
  );
  const setPrayCardCarouselApi = useBaseStore(
    (state) => state.setPrayCardCarouselApi
  );

  useEffect(() => {
    fetchPrayCardListByGroupId(groupId);
    prayCardCarouselApi?.on("select", () => {
      const currentIndex = prayCardCarouselApi.selectedScrollSnap();
      const carouselLength = prayCardCarouselApi.scrollSnapList().length;
      if (currentIndex == 0) prayCardCarouselApi.scrollNext();
      if (currentIndex == carouselLength - 1) prayCardCarouselApi.scrollPrev();
    });
  }, [prayCardCarouselApi, fetchPrayCardListByGroupId, groupId]);

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
