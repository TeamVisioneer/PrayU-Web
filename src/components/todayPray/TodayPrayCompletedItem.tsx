import { getISOTodayDateYMD } from "@/lib/utils";
import { useEffect, useState } from "react";
import { BibleCardLink, KakaoShareButton } from "../share/KakaoShareBtn";
import useBaseStore from "@/stores/baseStore";
import TodayPrayReplayBtn from "./TodayPrayRePlayBtn";
import { Button } from "../ui/button";
import { bibleVerses } from "@/Enums/qtData";
import newIcon from "@/assets/newIcon.svg";
import { analyticsTrack } from "@/analytics/analytics";

const TodayPrayCompletedItem = () => {
  const today = getISOTodayDateYMD();
  const contentNumber = parseInt(today.day, 10) % 31;
  const isPrayToday = useBaseStore((state) => state.isPrayToday);

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

  const onClickQtBtn = () => {
    analyticsTrack("클릭_QT_페이지", { where: "TodayPrayCompletedItemP" });
    window.location.href = `/qt?verse=${
      bibleVerses[contentNumber as keyof typeof bibleVerses]
    }`;
  };

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
    <div className="h-full flex flex-col gap-4 justify-center items-center">
      <div className="w-5/6 md:w-3/4 lg:w-2/3 xl:w-1/2 aspect-square flex flex-col items-center">
        <img
          className={`h-full rounded-2xl transition-opacity duration-1000 ease-in ${
            showImage ? "opacity-100" : "opacity-0"
          }`}
          src={`https://qggewtakkrwcclyxtxnz.supabase.co/storage/v1/object/public/prayu/BibleContent/content${contentNumber}.png`}
          onLoad={() => setIsImageLoaded(true)}
        />
      </div>
      <div
        className={`flex flex-col justify-center items-center px-4 transition-opacity duration-1000 ease-in-out ${
          showTitleText ? "opacity-100" : "opacity-0"
        }`}
      >
        <h1 className="text-lg md:text-xl lg:text-2xl">
          {today.year}.{today.month}.{today.day} 오늘의 말씀
        </h1>
      </div>
      <section
        className={`flex flex-col items-center gap-3 w-5/6 md:w-3/4 lg:w-2/3 xl:w-1/2 max-w-md transition-opacity duration-1000 ease-in-out ${
          showButton ? "opacity-100" : "opacity-0"
        }`}
      >
        <KakaoShareButton
          className={`w-full flex flex-col items-center gap-2 transition-opacity duration-1000 ease-in-out ${
            showButton ? "opacity-100" : "opacity-0"
          }`}
          buttonText="말씀카드 공유하기"
          kakaoLinkObject={BibleCardLink()}
          eventOption={{ where: "TodayPrayCompletedItem" }}
        />
        <Button
          className="w-full relative flex items-center justify-center"
          variant="primaryLight"
          onClick={() => onClickQtBtn()}
        >
          <img src={newIcon} className="absolute left-4" />
          <p>오늘의 QT 보기</p>
        </Button>

        <TodayPrayReplayBtn eventOption={{ where: "TodayPrayCompletedItem" }} />
      </section>
    </div>
  );
};

export default TodayPrayCompletedItem;
