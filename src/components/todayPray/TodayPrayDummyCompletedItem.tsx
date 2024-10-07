import { getISOTodayDateYMD } from "@/lib/utils";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import useBaseStore from "@/stores/baseStore";
import OpenShareDrawerBtn from "../share/OpenShareDrawerBtn";

const TodayPrayDummyCompletedItem = () => {
  const today = getISOTodayDateYMD();
  const contentNumber = parseInt(today.day, 10) % 31;
  const setIsOpenTodayPrayDrawer = useBaseStore(
    (state) => state.setIsOpenTodayPrayDrawer
  );
  const prayCardCarouselIndex = useBaseStore(
    (state) => state.prayCardCarouselIndex
  );
  const prayCardCarouselApi = useBaseStore(
    (state) => state.prayCardCarouselApi
  );

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showTitleText, setShowTitleText] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (
      prayCardCarouselApi &&
      prayCardCarouselIndex !== prayCardCarouselApi!.scrollSnapList().length - 2
    ) {
      setShowImage(false);
      setShowTitleText(false);
      setShowButton(false);
      return;
    }
    if (isImageLoaded) {
      const imageTimeout = setTimeout(() => {
        setShowImage(true);
      }, 500);
      const textTimeout = setTimeout(() => {
        setShowTitleText(true);
      }, 1000);
      const buttonTimeout = setTimeout(() => {
        setShowButton(true);
      }, 1500);
      return () => {
        clearTimeout(imageTimeout);
        clearTimeout(textTimeout);
        clearTimeout(buttonTimeout);
      };
    }
  }, [isImageLoaded, prayCardCarouselIndex, prayCardCarouselApi]);

  return (
    <div className="relative flex flex-col gap-4 justify-center items-center min-h-80vh max-h-80vh pb-10">
      <div className="h-[280px] w-full flex flex-col items-center">
        <img
          className={`h-full rounded-2xl transition-opacity duration-1000 ease-in ${
            showImage ? "opacity-100" : "opacity-0"
          }`}
          src={`https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/BibleContent/content${contentNumber}.png`}
          onLoad={() => setIsImageLoaded(true)}
        />
      </div>
      <div
        className={`flex flex-col justify-center items-center gap-1 transition-opacity duration-1000 ease-in-out  ${
          showTitleText ? "opacity-100" : "opacity-0"
        }`}
      >
        <h1 className="text-xl">
          {today.year}.{today.month}.{today.day} 오늘의 말씀
        </h1>
        <p className="font-light">친구들과 함께 오늘의 기도를 진행해 보아요</p>
      </div>
      <OpenShareDrawerBtn
        className={`w-64 flex flex-col items-center gap-2 transition-opacity duration-1000 ease-in-out ${
          showButton ? "opacity-100" : "opacity-0"
        }`}
        text="친구 초대하기"
        eventOption={{ where: "TodayPrayDummyCompletedItem" }}
      />
      <button
        className="absolute bottom-10 flex gap-1 items-center text-gray-400"
        onClick={() => setIsOpenTodayPrayDrawer(false)}
      >
        <IoClose />
        닫기
      </button>
    </div>
  );
};

export default TodayPrayDummyCompletedItem;
