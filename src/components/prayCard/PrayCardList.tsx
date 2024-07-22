import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import useBaseStore from "@/stores/baseStore";
import PrayCardUI from "./PrayCardUI";

interface PrayCardListProps {
  currentUserId: string | undefined;
}

// TODO: PrayData 한번에 가져와서 미리 렌더링 할 수 있도록 수정
const PrayCardList: React.FC<PrayCardListProps> = ({ currentUserId }) => {
  const groupPrayCardList = useBaseStore((state) => state.groupPrayCardList);

  return (
    <Carousel>
      <CarouselContent>
        <CarouselItem className="basis-5/6 pointer-events-none">
          <div className="flex justify-center items-center w-full aspect-square">
            start
          </div>
        </CarouselItem>
        {groupPrayCardList
          ?.filter((prayCard) => prayCard.user_id != currentUserId)
          .map((prayCard) => (
            <CarouselItem key={prayCard.id} className="basis-5/6">
              <PrayCardUI currentUserId={currentUserId} prayCard={prayCard} />
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
