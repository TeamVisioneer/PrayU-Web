import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
      image: "/images/notice/Group_List_1.gif",
      alt: "그룹 이동 방법 1",
      tip: "TIP 1",
      description:
        "그룹 화면에서 그룹 이름을 클릭하여 목록을 확인할 수 있어요!",
    },
    {
      image: "/images/notice/Group_List_2.gif",
      alt: "그룹 이동 방법 2",
      tip: "TIP 2",
      description: "그룹 메뉴에서도 기존처럼 그룹간 이동이 가능해요!",
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
      {Array.from({ length: 2 }, (_, index) => (
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

  const currentUpdateDate = "2025-02-12";

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
      onOpenChange={setIsOpenWeekUpdateDialog}
    >
      <DialogContent className="w-11/12 h-auto overflow-auto rounded-2xl bg-mainBg">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg">
            📢 그룹간 이동방법 변경안내
          </DialogTitle>
          <hr className="my-3" />
          <div className="w-full">
            <Carousel setApi={setApi}>
              <CarouselContent>
                {slides.map((slide, index) => (
                  <CarouselItem key={index}>
                    <div className="flex items-center gap-4">
                      <div className="w-1/2">
                        <img
                          src={slide.image}
                          alt={slide.alt}
                          className="w-full rounded-lg shadow-md"
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
              더이상 보지 않기
            </p>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default WeekUpdateDialog;
