import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import useBaseStore from "@/stores/baseStore";
import OpenShareDrawerBtn from "../share/OpenShareDrawerBtn";
import completed from "@/assets/completed.svg";
import TodayPrayReplayBtn from "./TodayPrayRePlayBtn";

const TodayPrayDummyCompletedItem = () => {
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
    <div className="relative flex flex-col justify-between items-center h-80vh">
      <div className=""></div>
      <div className="flex flex-col gap-4 justify-center items-center">
        <section
          className={`flex flex-col gap-6 items-center transition-opacity duration-1000 ease-in ${
            showImage ? "opacity-100" : "opacity-0"
          }`}
        >
          <h1 className="text-2xl font-bold">오늘의 기도 완료</h1>
          <div className="h-[120px] w-[120px] flex flex-col items-center">
            <img
              className="h-full w-full rounded-2xl"
              src={completed}
              onLoad={() => setIsImageLoaded(true)}
            />
          </div>
        </section>
        <section
          className={`flex flex-col justify-center items-center text-liteBlack transition-opacity duration-1000 ease-in-out  ${
            showTitleText ? "opacity-100" : "opacity-0"
          }`}
        >
          <p>친구들의 기도제목으로</p>
          <p>오늘의 기도를 시작해 보아요</p>
        </section>
        <section
          className={`flex flex-col items-center gap-4 transition-opacity duration-1000 ease-in-out ${
            showButton ? "opacity-100" : "opacity-0"
          }`}
        >
          <OpenShareDrawerBtn
            className="w-56 flex flex-col items-center gap-2"
            text="친구 초대하기"
            eventOption={{ where: "TodayPrayDummyCompletedItem" }}
          />
          <TodayPrayReplayBtn
            eventOption={{ where: "TodayPrayDummyCompletedItem" }}
          />
        </section>
      </div>
      <button
        className="flex gap-1 items-center text-gray-400"
        onClick={() => setIsOpenTodayPrayDrawer(false)}
      >
        <IoClose />
        닫기
      </button>
    </div>
  );
};

export default TodayPrayDummyCompletedItem;
