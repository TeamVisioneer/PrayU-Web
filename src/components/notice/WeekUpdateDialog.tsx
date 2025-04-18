import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import useBaseStore from "@/stores/baseStore";
import { Badge } from "../ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselApi,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { analyticsTrack } from "@/analytics/analytics";

const WeekUpdateDialog = () => {
  const isOpenWeekUpdateDialog = useBaseStore(
    (state) => state.isOpenWeekUpdateDialog
  );
  const setIsOpenWeekUpdateDialog = useBaseStore(
    (state) => state.setIsOpenWeekUpdateDialog
  );

  const slides = [
    {
      image: "/images/notice/NewPrayCardFlow.gif",
      tip: "TIP 1",
      description:
        "기도카드 생성 과정을 업데이트 했어요! 한번에 여러그룹에 기도카드를 올려보아요.",
    },
    {
      image: "/images/notice/GroupJoinFlow.gif",
      tip: "TIP 2",
      description:
        "그룹원 초대 과정을 업데이트 했어요! 링크를 통해 참여 완료 후 앱에서 그룹을 확인해보아요.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);

  const handleDotsClick = (index: number) => {
    if (!api) return;
    setCurrentIndex(index);
    api.scrollTo(index);
  };

  const CarouselDots = () => (
    <div className="flex justify-center items-center mt-2 p-4">
      {Array.from({ length: slides.length }, (_, index) => (
        <span
          key={index}
          className={` mx-1 rounded-full cursor-pointer transition-colors duration-300 ${
            currentIndex === index
              ? "w-[8px] h-[8px] bg-[#608CFF]"
              : "h-[6px] w-[6px] bg-gray-400"
          }`}
          onClick={() => handleDotsClick(index)}
        ></span>
      ))}
    </div>
  );

  const currentUpdateDate = "2025-04-10";

  useEffect(() => {
    const lastSeenDate = localStorage.getItem("WeekUpdateDialog");
    setIsOpenWeekUpdateDialog(lastSeenDate !== currentUpdateDate);
  }, [setIsOpenWeekUpdateDialog]);

  const onClickHideWeekUpdateDialog = () => {
    localStorage.setItem("WeekUpdateDialog", currentUpdateDate);
    setIsOpenWeekUpdateDialog(false);
    analyticsTrack("클릭_공지_안내팝업", { where: "WeekUpdateDialog" });
  };

  return (
    <Dialog
      open={isOpenWeekUpdateDialog}
      onOpenChange={(open) => {
        setIsOpenWeekUpdateDialog(open);
        if (!open && window.history.state?.open === true) window.history.back();
      }}
    >
      <DialogContent className="w-11/12 h-auto overflow-auto rounded-2xl transition-all duration-300 ease-in-out">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg">
            📢 기도카드 업데이트 안내
          </DialogTitle>
          <DialogDescription />
          <hr className="my-3" />
          <div className="w-full">
            <Carousel setApi={setApi}>
              <CarouselContent>
                {slides.map((slide, index) => (
                  <CarouselItem key={index}>
                    <div className="flex items-center h-full gap-4">
                      <div className="w-1/2">
                        <img
                          src={slide.image}
                          className="w-full rounded-lg border-gray-400 shadow-md"
                        />
                      </div>
                      <div className="w-1/2 space-y-2 text-left">
                        <Badge variant="secondary" className="px-0">
                          {slide.tip}
                        </Badge>
                        <p className="text-sm">{slide.description}</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselDots />
              <CarouselPrevious className="h-6 w-6 -left-4" />
              <CarouselNext className="h-6 w-6 -right-4" />
            </Carousel>
            <p
              onClick={() => onClickHideWeekUpdateDialog()}
              className="text-sm text-gray-400 underline text-center"
            >
              더 이상 보지 않기
            </p>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default WeekUpdateDialog;
