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
      image: "/images/notice/prayu_premium.png",
      tip: "앱 리뷰 이벤트 참여 방법",
      description: [
        "1. PlayStore 와 AppStore 에서 앱 리뷰를 남기기",
        "2. 우측 메뉴탭 > 카카오톡 문의하기에서 리뷰 확인 요청하기",
        "3. Premium Plan 받고 그룹 무제한 생성하기",
      ],
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

  const currentUpdateDate = "2025-09-13";

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
      <DialogContent className="p-0 w-11/12 rounded-2xl focus:outline-none border-none">
        <DialogHeader className="text-left p-5 pb-0">
          <DialogTitle className="text-lg">📢 PrayU 리뷰 이벤트</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <div className="w-full px-5">
          <hr className="my-3" />
          <Carousel setApi={setApi}>
            <CarouselContent>
              {slides.map((slide, index) => (
                <CarouselItem key={index}>
                  <div className="flex flex-col items-center h-full gap-4">
                    <div className="w-full">
                      <img
                        src={slide.image}
                        className="w-full rounded-lg border-gray-400 shadow-md"
                      />
                    </div>
                    <div className="w-full space-y-2 text-left">
                      <span className="text-sm font-bold">{slide.tip}</span>
                      {slide.description.map((description, index) => (
                        <p key={index} className="text-sm">
                          {description}
                        </p>
                      ))}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {slides.length > 1 && <CarouselDots />}
            {slides.length > 1 && (
              <>
                <CarouselPrevious className="h-6 w-6 -left-4" />
                <CarouselNext className="h-6 w-6 -right-4" />
              </>
            )}
          </Carousel>
        </div>
        <div className="grid grid-cols-2 w-full mt-6 border-t border-gray-200  overflow-hidden">
          <button
            onClick={onClickHideWeekUpdateDialog}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-4 font-medium rounded-bl-lg"
          >
            더 이상 보지 않기
          </button>
          <button
            onClick={onClickClose}
            className="bg-[#608CFF] hover:bg-[#4a70e2] text-white p-4 font-medium rounded-br-lg"
          >
            확인
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WeekUpdateDialog;
