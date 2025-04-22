import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import useBaseStore from "@/stores/baseStore";
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

  // useEffect(() => {
  //   const lastSeenDate = localStorage.getItem("WeekUpdateDialog");
  //   setIsOpenWeekUpdateDialog(lastSeenDate !== currentUpdateDate);
  // }, [setIsOpenWeekUpdateDialog]);

  const onClickHideWeekUpdateDialog = () => {
    localStorage.setItem("WeekUpdateDialog", currentUpdateDate);
    setIsOpenWeekUpdateDialog(false);
    analyticsTrack("클릭_공지_안내팝업", { where: "WeekUpdateDialog" });
  };

  const onClickClose = () => {
    setIsOpenWeekUpdateDialog(false);
    analyticsTrack("클릭_공지_닫기", { where: "WeekUpdateDialog" });
  };

  return (
    <Dialog
      open={isOpenWeekUpdateDialog}
      onOpenChange={(open) => {
        setIsOpenWeekUpdateDialog(open);
        if (!open && window.history.state?.open === true) window.history.back();
      }}
    >
      <DialogContent className="p-0 w-11/12 rounded-2xl focus:outline-none">
        <DialogHeader className="text-left p-5 pb-0">
          <DialogTitle className="text-lg">
            📢 기도카드 업데이트 안내
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <div className="w-full px-5">
          <hr className="my-3" />
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
                      <span className="text-sm font-bold">{slide.tip}</span>
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
        </div>
        <div className="grid grid-cols-2 w-full mt-6 border-t border-gray-200 ">
          <button
            onClick={onClickHideWeekUpdateDialog}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 font-medium"
          >
            더 이상 보지 않기
          </button>
          <button
            onClick={onClickClose}
            className="bg-[#608CFF] hover:bg-[#4a70e2] text-white p-4 font-medium rounded-br-2xl"
          >
            확인
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WeekUpdateDialog;
