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
import { GroupInviteLink, KakaoShareButton } from "./KakaoShareBtn";
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
          description: "🔗 그룹 링크가 복사되었어요",
        });
      })
      .catch((err) => {
        console.error("복사하는 중 오류가 발생했습니다: ", err);
      });
    analyticsTrack("클릭_공유_링크복사", {});
  };

  const onOpenChangeDrawer = (isOpenShareDrawer: boolean) => {
    setIsOpenShareDrawer(isOpenShareDrawer);
    analyticsTrack("드로어_초대", { isOpen: isOpenShareDrawer });
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
    analyticsTrack("클릭_공유_캐러셀도트", { index });
  };

  const CarouselDots = () => (
    <div className="flex justify-center items-center pb-4">
      {Array.from({ length: 3 }, (_, index) => (
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

  const ImageCerousel = (
    <Carousel setApi={setApi}>
      <CarouselDots />
      <CarouselContent>
        <CarouselItem className="flex flex-col items-center gap-6">
          <div className="h-[200px] w-full flex flex-col items-center">
            <img className="h-full rounded-md" src="/images/InviteDrawer.png" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-base font-bold text-[#222222]">
              함께 기도할 그룹원들을 초대해보아요
            </p>
            <div className="text-sm text-[#919191]">
              <p>초대 링크를 보내면 새 그룹원들이</p>
              <p>편하게 참여할 수 있어요</p>
            </div>
          </div>
        </CarouselItem>
        <CarouselItem className="flex flex-col items-center gap-4">
          <div className="h-[200px] w-full flex flex-col  items-center">
            <img
              className="h-full rounded-md shadow-prayCard"
              src="/images/KakaoNotification.png"
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-base font-bold text-[#222222]">그룹 링크 공지</p>
            <div className="text-sm text-[#919191]">
              <p>링크를 공지에 등록하고</p>
              <p>채팅방에서 편하게 접근해요</p>
            </div>
          </div>
        </CarouselItem>
        <CarouselItem className="flex flex-col items-center gap-4">
          <div className="h-[200px] w-full flex flex-col items-center">
            <img
              className="h-full rounded-md shadow-prayCard"
              src="/images/KakaoShareMessage.png"
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-base font-bold text-[#222222]">
              카카오톡 초대 전송
            </p>
            <div className="text-sm text-[#919191]">
              <p>카카오톡 초대하기를 통해</p>
              <p>그룹 입장 카드를 전송할 수 있어요</p>
            </div>
          </div>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  );

  const DrawerBody = (
    <div className="flex flex-col items-center text-center gap-8 pb-10">
      {ImageCerousel}
      <div className="flex flex-col gap-3">
        <KakaoShareButton
          className="w-60 h-11 text-[0.95rem] rounded-[10px]"
          buttonText="카카오톡 공유하기"
          kakaoLinkObject={GroupInviteLink(targetGroup?.name || "")}
          eventOption={{ where: "GroupPage" }}
        />
        <Button
          variant="primaryLight"
          className="w-60 h-11 text-[0.95rem] rounded-[10px]"
          onClick={() => onClickCopyLink()}
        >
          그룹 링크 복사하기
        </Button>
      </div>
    </div>
  );

  return (
    <Drawer
      open={isOpenShareDrawer}
      onOpenChange={(open) => {
        setIsOpenShareDrawer(open);
        if (!open && window.history.state?.open === true) window.history.back();
      }}
    >
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
