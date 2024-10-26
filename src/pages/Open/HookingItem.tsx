import { useEffect, useState } from "react";
import useBaseStore from "@/stores/baseStore";
import CountUp from "react-countup";

const TodayPrayCompletedItem = () => {
  const isPrayToday = useBaseStore((state) => state.isPrayToday);
  const totalPrayCount = useBaseStore((state) => state.totalPrayCount);
  const fetchTotalPrayCount = useBaseStore(
    (state) => state.fetchTotalPrayCount
  );

  useEffect(() => {
    fetchTotalPrayCount();
  }, [fetchTotalPrayCount]);

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
      prayCardCarouselIndex !== prayCardCarouselApi.scrollSnapList().length - 2
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
  }, [isImageLoaded, prayCardCarouselIndex, prayCardCarouselApi, isPrayToday]);

  return (
    <div className="relative flex flex-col gap-4 justify-center items-center min-h-80vh max-h-80vh pb-10">
      <div className="h-[260px] w-full flex flex-col items-center">
        <img
          className={`h-full rounded-2xl transition-opacity duration-1000 ease-in ${
            showImage ? "opacity-100" : "opacity-0"
          }`}
          src={`/images/appIcon.png`}
          onLoad={() => setIsImageLoaded(true)}
        />
      </div>
      <div
        className={`flex flex-col justify-center items-center gap-1 transition-opacity duration-1000 ease-in-out ${
          showTitleText ? "opacity-100" : "opacity-0"
        }`}
      >
        <h2 className="text-lg ">앞으로도 그룹원들과</h2>
        <h1 className="text-xl font-bold">지.속.적.으.로.</h1>
        <p className="font-light">우리만의 기도제목 나눔공간 PrayU</p>
      </div>
      <section
        className={`flex flex-col items-center gap-4 transition-opacity duration-1000 ease-in-out ${
          showButton ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="left-0 right-0 text-base p-2 text-center bg-opacity-50 bottom-0 ">
          <p className=" leading-tight gmarket-font">
            <CountUp
              start={0}
              end={totalPrayCount}
              duration={5}
              separator=","
              className="text-indigo-800 font-extrabold text-2xl"
            />{" "}
            번의 기도가
          </p>
          <p className="leading-tight gmarket-font">
            PrayU 를 통해 전달되었어요
          </p>
        </div>
      </section>
    </div>
  );
};

export default TodayPrayCompletedItem;
