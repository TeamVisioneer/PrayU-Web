import useBaseStore from "@/stores/baseStore";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { KakaoShareButton } from "./KakaoShareBtn";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { analyticsTrack } from "@/analytics/analytics";
import { useEffect, useState } from "react";

const ShareDrawer: React.FC = () => {
  const targetGroup = useBaseStore((state) => state.targetGroup);
  const isOpenShareDrawer = useBaseStore((state) => state.isOpenShareDrawer);
  const setIsOpenShareDrawer = useBaseStore(
    (state) => state.setIsOpenShareDrawer
  );

  const onClickCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        toast({
          description: "그룹 링크가 복사되었어요 🔗",
        });
      })
      .catch((err) => {
        console.error("복사하는 중 오류가 발생했습니다: ", err);
      });
    analyticsTrack("클릭_공유_링크복사", {});
  };

  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

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
    <div className="flex justify-center items-center mt-6">
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

  const ImageCerousel = (
    <Carousel setApi={setApi}>
      <CarouselContent>
        <CarouselItem className="flex flex-col items-center gap-4">
          <div className="h-[200px] flex flex-col  items-center">
            <img
              className="h-full rounded-md shadow-prayCard"
              src="/images/KakaoNotification.png"
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-base font-bold">그룹 링크 공지</p>
            <div>
              <p className="text-sm text-gray-500">링크를 공지에 등록하고</p>
              <p className="text-sm text-gray-500">
                채팅방에서 편하게 접근해요
              </p>
            </div>
          </div>
        </CarouselItem>
        <CarouselItem className="flex flex-col items-center gap-4">
          <div className="h-[200px] flex flex-col items-center">
            <img
              className="h-full rounded-md shadow-prayCard"
              src="/images/KakaoShareMessage.png"
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-base font-bold">카카오톡 초대 전송</p>
            <div>
              <p className="text-sm text-gray-500">카카오톡 초대하기를 통해</p>
              <p className="text-sm text-gray-500">
                그룹 입장 카드를 전송할 수 있어요
              </p>
            </div>
          </div>
        </CarouselItem>
      </CarouselContent>
      <CarouselDots />
    </Carousel>
  );

  const DrawerBody = (
    <div className="flex flex-col items-center text-center gap-6 pb-10">
      <div className="flex flex-col items-center">
        <p className="text-base font-bold">새 그룹원들을 초대해 보아요 📮</p>
      </div>

      {ImageCerousel}
      <div className="flex flex-col gap-2">
        <KakaoShareButton
          targetGroup={targetGroup}
          message="카카오톡으로 초대하기"
          eventOption={{ where: "GroupPage" }}
        />
        <Button
          className="px-10 py-2 rounded-md"
          onClick={() => onClickCopyLink()}
        >
          그룹 링크 복사하기
        </Button>
      </div>
    </div>
  );

  return (
    <Drawer open={isOpenShareDrawer} onOpenChange={setIsOpenShareDrawer}>
      <DrawerContent className="bg-mainBg focus:outline-none">
        <DrawerHeader className="p-2">
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        {DrawerBody}
      </DrawerContent>
    </Drawer>
  );
};

export default ShareDrawer;
