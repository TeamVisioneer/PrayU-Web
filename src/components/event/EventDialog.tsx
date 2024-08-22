import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import useBaseStore from "@/stores/baseStore";
import eventExample from "@/assets/event_example.svg";
import { useEffect, useState } from "react";

const EventDialog = () => {
  const isOpenEventDialog = useBaseStore((state) => state.isOpenEventDialog);
  const setIsOpenEventDialog = useBaseStore(
    (state) => state.setIsOpenEventDialog
  );
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleDotsClick = (index: number) => {
    if (!api) return;
    setCurrentIndex(index);
    api.scrollTo(index);
  };

  const CarouselDots = () => (
    <div className="flex justify-center items-center">
      {Array.from({ length: 2 }, (_, index) => (
        <span
          key={index}
          className={` mx-1 rounded-full cursor-pointer transition-colors duration-300 ${
            currentIndex === index
              ? "w-[8px] h-[8px] bg-mainBtn"
              : "h-[6px] w-[6px] bg-gray-400"
          }`}
          onClick={() => handleDotsClick(index)}
        ></span>
      ))}
    </div>
  );

  useEffect(() => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);
  return (
    <Dialog open={isOpenEventDialog} onOpenChange={setIsOpenEventDialog}>
      <DialogContent className="w-full aspect-[1/1] bg-mainBg">
        <DialogHeader>
          <DialogTitle className="text-md "> 🎉 진행중인 이벤트</DialogTitle>
          <DialogDescription className="text-xs text-gray-400">
            클릭하고 경품 받아가세요!!
          </DialogDescription>
        </DialogHeader>
        <Carousel className="flex w-full h-full" setApi={setApi}>
          <CarouselContent>
            <CarouselItem className="w-full h-full">
              <img
                onClick={() =>
                  (window.location.href =
                    "http://pf.kakao.com/_XaHDG/106447699")
                }
                className="w-[350px] h-[350px] rounded-xl"
                src={eventExample}
              />
            </CarouselItem>
            <CarouselItem>
              <img
                onClick={() =>
                  (window.location.href =
                    "https://slashpage.com/prayu-blog/dwy5rvmj18q972p46zn9")
                }
                className="w-[350px] h-[350px] rounded-xl"
                src={eventExample}
              />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
        <CarouselDots />
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;
