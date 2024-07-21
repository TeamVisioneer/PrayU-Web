import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import useBaseStore from "@/stores/baseStore";
import PrayCardUI from "./PrayCardUI";
import { type CarouselApi } from "@/components/ui/carousel";
import { useEffect, useState } from "react";

interface PrayCardListProps {
  currentUserId: string | undefined;
}

// TODO: PrayData 한번에 가져와서 미리 렌더링 할 수 있도록 수정
const PrayCardList: React.FC<PrayCardListProps> = ({ currentUserId }) => {
  const groupPrayCardList = useBaseStore((state) => state.groupPrayCardList);

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <Carousel setApi={setApi}>
      <CarouselContent>
        <CarouselItem className="basis-5/6 pointer-events-none">
          <div className="flex justify-center items-center w-full aspect-square">
            start
          </div>
        </CarouselItem>
        {groupPrayCardList?.map((prayCard, index) => (
          <CarouselItem key={prayCard.id} className="basis-5/6">
            {(current - 1 === index + 2 ||
              current === index + 2 ||
              current + 1 === index + 2) && (
              <PrayCardUI currentUserId={currentUserId} prayCard={prayCard} />
            )}
          </CarouselItem>
        ))}
        <CarouselItem className="basis-5/6 pointer-events-none">
          <div className="flex justify-center items-center w-full aspect-square">
            end
          </div>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  );
};

export default PrayCardList;
